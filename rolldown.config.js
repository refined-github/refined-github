import browserslist from 'browserslist';
import {browserslistToTargets, Features} from 'lightningcss';
import process from 'node:process';
import {defineConfig} from 'rolldown';
import copy from 'rollup-plugin-copy';
import styles from 'rollup-plugin-styler';
import svelte from 'rollup-plugin-svelte';
import webpackStatsPlugin from 'rollup-plugin-webpack-stats';
import lightning from 'unplugin-lightningcss/rollup';

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
		lightning({
			options: {
				include: Features.Nesting,
				// Lighting issue: https://github.com/parcel-bundler/lightningcss/issues/826#issuecomment-2453982986
				targets: browserslistToTargets(browserslist('chrome 123, firefox 126, iOS 17.5')),
			},
		}),
		svelte(svelteConfig),
		styles({
			mode: 'extract',
			url: false,
		}),
		{
			name: 'css-as-js', // Rolldown refuses to bundle CSS, but `styles` already turned it into JS
			transform: {
				order: 'post',
				handler: (code, id) => id.endsWith('.css') ? {code, moduleType: 'js'} : undefined,
			},
		},
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
