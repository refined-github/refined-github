import browserslist from 'browserslist';
import {browserslistToTargets, Features, transform} from 'lightningcss';
import {readFileSync} from 'node:fs';
import process from 'node:process';
import {defineConfig} from 'rolldown';
import copy from 'rollup-plugin-copy';
import svelte from 'rollup-plugin-svelte';
import webpackStatsPlugin from 'rollup-plugin-webpack-stats';

import svelteConfig from './svelte.config.js';

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
// Avoid the `.css` extension, Rolldown refuses to bundle CSS
const cssSuffix = '.rgh';

// Replaces the per-module CSS files with a single CSS file per entry point, containing every CSS file that the entry imports (`refined-github.css`, `options.css`, …).
// Needed because `preserveModules` would output one CSS file per module: https://github.com/refined-github/refined-github/pull/7773
function extractCss(entries) {
	const cssByEntry = new Map();
	return {
		name: 'extract-css',
		async resolveId(source, importer, options) {
			if (!importer || !source.endsWith('.css') || importer.startsWith(cssPrefix)) {
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

				const files = new Set();
				const visited = new Set();
				const visit = moduleId => {
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
			// Lighting issue: https://github.com/parcel-bundler/lightningcss/issues/826#issuecomment-2453982986
			const targets = browserslistToTargets(browserslist('chrome 123, firefox 126, iOS 17.5'));
			for (const chunk of Object.values(bundle)) {
				if (chunk.type !== 'chunk' || !chunk.isEntry || !entries.includes(chunk.name)) {
					continue;
				}

				const files = cssByEntry.get(chunk.facadeModuleId);
				if (!files?.length) {
					continue;
				}

				const source = files.map(filename =>
					transform({
						filename,
						code: readFileSync(filename),
						include: Features.Nesting,
						targets,
					}).code.toString()
				).join('\n');

				this.emitFile({
					type: 'asset',
					fileName: chunk.fileName.replace(/\.js$/, '.css'),
					source,
				});
			}
		},
	};
}

// eslint-disable-next-line unicorn/no-top-level-side-effects -- TODO: https://github.com/sindresorhus/eslint-plugin-unicorn/pull/3893
export default defineConfig({
	input: {
		options: './source/options.tsx',
		'options-components': './source/options.svelte',
		welcome: './source/welcome.svelte',
		graphql: './source/graphql.svelte',

		'refined-github': './source/refined-github.ts',
		'content-script': './source/content-script.ts',
		background: './source/background.ts',
	},
	platform: 'browser',
	resolve: {
		alias: {react: 'dom-chef'},
		conditionNames: ['production', 'browser', 'module', 'import', 'default'],
	},
	transform: {
		// Also for dependencies that ship `.tsx` files
		jsx: {
			runtime: 'classic',
			pragma: 'React.createElement',
			pragmaFrag: 'React.Fragment',
		},
	},
	moduleTypes: {
		'.gql': 'text',
		'.svg': 'text',
	},
	output: {
		dir: 'distribution/assets',
		cleanDir: true,
		preserveModules: true,
		preserveModulesRoot: 'source',
		assetFileNames: '[name][extname]', // For CSS
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
	watch: {
		clearScreen: false,
	},

	// TODO: Drop after https://github.com/fregante/webext-options-sync-per-domain/issues/17
	context: 'globalThis',
	onwarn(warning, defaultHandler) {
		if (
			warning.code === 'CIRCULAR_DEPENDENCY'
			&& warning.ids?.every(id => id.includes('/svelte/'))
		) {
			return;
		}

		// Fail the build immediately on unresolved dependencies. How is this not a default?!
		if (warning.code === 'UNRESOLVED_IMPORT') {
			throw new Error(warning.message);
		}

		defaultHandler(warning);
	},
	plugins: [
		extractCss(['refined-github', 'options', 'options-components']),
		svelte(svelteConfig),
		copy({
			hook: 'writeBundle', // After `cleanDir`
			targets: [
				{src: './source/manifest.json', dest: 'distribution'},
				{src: './source/*.+(html|png|js)', dest: 'distribution/assets'},
			],
		}),
		process.env.RELATIVE_CI_STATS ? webpackStatsPlugin() : undefined,
	],
});
