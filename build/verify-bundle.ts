/**
Verifies the output of the bundler (`distribution/`) independently of the bundler itself, to prevent regressions when changing the build.
It checks that:
- the CSS bundles contain exactly the CSS files that their entry point imports, in the right order
- there are no stray CSS files and no unexpected dependencies left unbundled
- every file referenced by the manifest and the HTML pages exists
- features still get their ID from `import.meta.url`

Run it after `vite build`.
*/

import browserslist from 'browserslist';
import {init, parse} from 'es-module-lexer';
import {browserslistToTargets, Features, transform} from 'lightningcss';
import {existsSync, readdirSync, readFileSync, statSync} from 'node:fs';
import {createRequire} from 'node:module';
import path from 'node:path';
import process from 'node:process';

const sourceDirectory = path.resolve('source');
const distributionDirectory = path.resolve('distribution');
const assetsDirectory = path.join(distributionDirectory, 'assets');

/** CSS bundle name => entry point that determines its contents */
const cssBundles = {
	'refined-github': 'refined-github.ts',
	options: 'options.tsx',
	'options-components': 'options.svelte',
};

const errors: string[] = [];

function fail(message: string): void {
	errors.push(message);
}

function listFiles(directory: string): string[] {
	return readdirSync(directory, {withFileTypes: true}).flatMap(entry => {
		const file = path.join(directory, entry.name);
		return entry.isDirectory() ? listFiles(file) : file;
	});
}

function isFile(file: string): boolean {
	return existsSync(file) && statSync(file).isFile();
}

const relativeToDistribution = (file: string): string =>
	path.relative(distributionDirectory, file).replaceAll('\\', '/');

// ---------- CSS ----------

const require = createRequire(path.resolve('package.json'));
const targets = browserslistToTargets(browserslist());

function compileCss(file: string): string {
	const {code} = transform({
		filename: file,
		code: readFileSync(file),
		include: Features.Nesting,
		targets,
	});
	return code.toString();
}

// Type-only imports are skipped because they don't exist at runtime
const staticImportPattern = /^\s*(?:import|export)\s(?!type\s)(?:[\s\w$*,{}]+?from\s*)?["'](?<specifier>[^"']+)["']/gm;

function resolveSourceImport(importer: string, specifier: string): string | undefined {
	if (specifier.startsWith('.')) {
		const base = path.resolve(path.dirname(importer), specifier);
		return [base, base.replace(/\.js$/, '.ts'), base.replace(/\.js$/, '.tsx')].find(file => isFile(file));
	}

	if (specifier.endsWith('.css')) {
		return require.resolve(specifier);
	}

	// Other dependencies are not crawled
	return undefined;
}

/** Lists the CSS files that the entry imports, in the order that browsers should receive them (dependencies first) */
function findCssFiles(entry: string): string[] {
	const cssFiles = new Set<string>();
	const visited = new Set<string>();

	function visit(file: string): void {
		if (visited.has(file)) {
			return;
		}

		visited.add(file);
		if (file.endsWith('.css')) {
			cssFiles.add(file);
			return;
		}

		if (!/\.(?:ts|tsx|js|svelte)$/.test(file)) {
			return;
		}

		for (const {groups} of readFileSync(file, 'utf8').matchAll(staticImportPattern)) {
			const resolved = resolveSourceImport(file, groups!.specifier);
			if (resolved) {
				visit(resolved);
			}
		}
	}

	visit(entry);
	return [...cssFiles];
}

function verifyCss(): void {
	const expectedFiles = new Set(Object.keys(cssBundles).map(name => `${name}.css`));
	for (const file of listFiles(assetsDirectory)) {
		if (file.endsWith('.css') && !expectedFiles.has(path.relative(assetsDirectory, file))) {
			fail(`Unexpected CSS file: ${relativeToDistribution(file)}`);
		}
	}

	for (const [name, entry] of Object.entries(cssBundles)) {
		const cssFiles = findCssFiles(path.join(sourceDirectory, entry));
		if (cssFiles.length === 0) {
			fail(`${entry} doesn't import any CSS files, the bundle should not exist`);
			continue;
		}

		const bundle = path.join(assetsDirectory, `${name}.css`);

		if (!isFile(bundle)) {
			fail(`Missing CSS bundle: ${relativeToDistribution(bundle)}`);
			continue;
		}

		const expected = cssFiles.map(file => compileCss(file)).join('\n');
		if (readFileSync(bundle, 'utf8') !== expected) {
			fail(
				`${relativeToDistribution(bundle)} doesn't match the CSS files imported by ${entry} (${cssFiles.length} files)`,
			);
		}
	}
}

// ---------- JS ----------

async function verifyJavaScript(): Promise<void> {
	await init();
	const files = listFiles(assetsDirectory).filter(file => file.endsWith('.js'));
	for (const file of files) {
		const [imports] = parse(readFileSync(file, 'utf8'));
		for (const {specifier} of imports) {
			if (!specifier) {
				continue;
			}

			if (!specifier.startsWith('.')) {
				fail(`${relativeToDistribution(file)} imports "${specifier}", but dependencies must be bundled`);
			} else if (!isFile(path.resolve(path.dirname(file), specifier))) {
				fail(`${relativeToDistribution(file)} imports "${specifier}", which doesn't exist`);
			}
		}
	}

	// Features are identified by the file name in `import.meta.url`, so it must not be replaced or bundled away
	const featuresDirectory = path.join(sourceDirectory, 'features');
	for (const file of listFiles(featuresDirectory)) {
		if (!(/\.tsx?$/.test(file) && /\bfeatures\.add\(\s*import\.meta\.url\b/.test(readFileSync(file, 'utf8')))) {
			continue;
		}

		const built = path.join(assetsDirectory, 'features', path.basename(file).replace(/\.tsx?$/, '.js'));
		if (!isFile(built) || !/\bfeatures\.add\(\s*import\.meta\.url\b/.test(readFileSync(built, 'utf8'))) {
			fail(`${path.relative(sourceDirectory, file)} should be built with \`features.add(import.meta.url\``);
		}
	}
}

// ---------- Referenced files ----------

function verifyReferences(): void {
	const manifestFile = path.join(distributionDirectory, 'manifest.json');
	if (!isFile(manifestFile)) {
		fail('Missing distribution/manifest.json');
		return;
	}

	const manifest = JSON.parse(readFileSync(manifestFile, 'utf8')) as chrome.runtime.ManifestV3;
	const manifestFiles = [
		manifest.background?.service_worker,
		...[manifest.action?.default_icon ?? []].flat().flatMap(icon =>
			typeof icon === 'string' ? icon : Object.values(icon)
		),
		...(manifest.content_scripts ?? []).flatMap(script => [...script.js ?? [], ...script.css ?? []]),
	];
	for (const file of manifestFiles) {
		if (typeof file === 'string' && !isFile(path.join(distributionDirectory, file))) {
			fail(`manifest.json references a missing file: ${file}`);
		}
	}

	for (const page of listFiles(assetsDirectory)) {
		if (!page.endsWith('.html')) {
			continue;
		}

		for (
			const {groups} of readFileSync(page, 'utf8').matchAll(/\b(?:src|href)=(?:"(?<double>[^"]+)"|'(?<single>[^']+)')/g)
		) {
			const reference = groups!.double ?? groups!.single;
			if (!/^(?:https?:|data:|#)/.test(reference) && !isFile(path.resolve(path.dirname(page), reference))) {
				fail(`${relativeToDistribution(page)} references a missing file: ${reference}`);
			}
		}
	}
}

verifyCss();
await verifyJavaScript();
verifyReferences();

if (errors.length > 0) {
	console.error(`Bundle verification failed:\n${errors.map(error => `- ${error}`).join('\n')}`);
	process.exitCode = 1;
} else {
	console.log('Bundle verified');
}
