import {svelte} from '@sveltejs/vite-plugin-svelte';
import browserslist from 'browserslist';
import {browserslistToTargets, Features, transform} from 'lightningcss';
import {readFileSync} from 'node:fs';
import process from 'node:process';
import webpackStatsPlugin from 'rollup-plugin-webpack-stats';
import {defineConfig, type Plugin} from 'vite';
import {viteStaticCopy} from 'vite-plugin-static-copy';

const noise = new Set([
	'index',
	'dist',
	'src',
	'source',
	'distribution',
	'node_modules',
	'main',
	'esm',
	'cjs',
	'build',
	'built',
]);

const cssPrefix = '\0rgh-css:';
// Avoid the `.css` extension so Vite's own CSS pipeline ignores these modules
const cssSuffix = '.rgh';

/** Import `.gql` files as strings */
function gqlAsString(): Plugin {
	return {
		name: 'gql-as-string',
		transform: (code, id) => id.endsWith('.gql') ? `export default ${JSON.stringify(code)};` : undefined,
	};
}

/**
Replaces the per-module CSS chunks with a single CSS file per entry point, containing every CSS file that the entry imports (`refined-github.css`, `options.css`, …).
Vite can't do this when `preserveModules` is enabled: https://github.com/refined-github/refined-github/pull/7773
*/
function extractCss(entries: string[]): Plugin {
	const cssByEntry = new Map<string, string[]>();
	return {
		name: 'extract-css',
		enforce: 'pre',
		async resolveId(source, importer, options) {
			if (!importer || !source.endsWith('.css') || importer.startsWith(cssPrefix) || importer.includes('?')) {
				return undefined;
			}

			const resolved = await this.resolve(source, importer, {...options, skipSelf: true});
			return resolved && !resolved.external ? cssPrefix + resolved.id + cssSuffix : undefined;
		},
		load(id) {
			return id.startsWith(cssPrefix) ? {code: '', moduleSideEffects: false} : undefined;
		},
		buildEnd() {
			cssByEntry.clear();
			for (const id of this.getModuleIds()) {
				if (!this.getModuleInfo(id)?.isEntry) {
					continue;
				}

				const files = new Set<string>();
				const visited = new Set<string>();
				const visit = (moduleId: string): void => {
					if (visited.has(moduleId)) {
						return;
					}

					visited.add(moduleId);
					for (const importedId of this.getModuleInfo(moduleId)?.importedIds ?? []) {
						visit(importedId);
					}

					if (moduleId.startsWith(cssPrefix)) {
						files.add(moduleId.slice(cssPrefix.length, -cssSuffix.length));
					}
				};

				visit(id);
				cssByEntry.set(id, [...files]);
			}
		},
		generateBundle(_, bundle) {
			const targets = browserslistToTargets(browserslist('chrome 123, firefox 126, iOS 17.5'));
			for (const chunk of Object.values(bundle)) {
				if (chunk.type !== 'chunk' || !chunk.isEntry || !chunk.facadeModuleId || !entries.includes(chunk.name)) {
					continue;
				}

				const files = cssByEntry.get(chunk.facadeModuleId);
				if (!files?.length) {
					continue;
				}

				const source = files.map(filename => {
					const {code} = transform({
						filename,
						code: readFileSync(filename),
						include: Features.Nesting,
						targets,
					});
					return code.toString();
				}).join('\n');

				this.emitFile({
					type: 'asset',
					fileName: chunk.fileName.replace(/\.js$/, '.css'),
					source,
				});
			}
		},
	};
}

/** Fail the build immediately on unresolved dependencies, since the extension can't load anything that isn't bundled */
function failOnExternalImports(): Plugin {
	return {
		name: 'fail-on-external-imports',
		generateBundle(_, bundle) {
			const files = new Set(Object.keys(bundle));
			for (const chunk of Object.values(bundle)) {
				if (chunk.type !== 'chunk') {
					continue;
				}

				for (const id of [...chunk.imports, ...chunk.dynamicImports]) {
					if (!files.has(id)) {
						throw new Error(`Unresolved import "${id}" in ${chunk.fileName}`);
					}
				}
			}
		},
	};
}

export default defineConfig({
	plugins: [
		gqlAsString(),
		failOnExternalImports(),
		extractCss(['refined-github', 'options', 'options-components']),
		svelte(),
		process.env.RELATIVE_CI_STATS ? webpackStatsPlugin() : undefined,
		viteStaticCopy({
			targets: [
				{src: 'source/manifest.json', dest: '..', rename: {stripBase: true}},
				{src: 'source/*.{html,png,js}', dest: '.', rename: {stripBase: true}},
			],
		}),
	],
	// Match `"jsx": "react"` in tsconfig.json, also for dependencies that ship `.tsx` files
	oxc: {
		jsx: {
			runtime: 'classic',
			pragma: 'React.createElement',
			pragmaFrag: 'React.Fragment',
		},
	},
	resolve: {
		alias: [{find: /^react$/, replacement: 'dom-chef'}],
	},
	build: {
		outDir: 'distribution/assets',
		emptyOutDir: true,
		target: 'esnext',
		minify: false,
		modulePreload: false,
		rolldownOptions: {
			input: {
				options: './source/options.tsx',
				'options-components': './source/options.svelte',
				welcome: './source/welcome.svelte',
				graphql: './source/graphql.svelte',
				'refined-github': './source/refined-github.ts',
				'content-script': './source/content-script.ts',
				background: './source/background.ts',
			},
			preserveEntrySignatures: 'strict',
			output: {
				preserveModules: true,
				preserveModulesRoot: 'source',
				entryFileNames(chunkInfo) {
					if (chunkInfo.name.includes('node_modules')) {
						const cleanName = chunkInfo.name
							.split('/')
							.filter(part => !noise.has(part))
							.join('-');
						return `npm/${cleanName}.js`;
					}

					return chunkInfo.name.replace('build/__snapshots__/', '') + '.js';
				},
			},
		},
	},
});
