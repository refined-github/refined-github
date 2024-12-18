import sucrase from '@rollup/plugin-sucrase';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import cleanup from 'rollup-plugin-cleanup';
import styles from 'rollup-plugin-styles';
import {string} from 'rollup-plugin-string';
import alias from '@rollup/plugin-alias';
import json from '@rollup/plugin-json';
import copy from 'rollup-plugin-copy';
import del from 'rollup-plugin-delete';
import webpackStatsPlugin from 'rollup-plugin-webpack-stats';
import svelte from 'rollup-plugin-svelte';
import lightning from 'unplugin-lightningcss/rollup';
import {Features, browserslistToTargets} from 'lightningcss';
import browserslist from 'browserslist';

import svelteConfig from './svelte.config.js';

const noise = new Set(['index', 'dist', 'src', 'source', 'distribution', 'node_modules', 'main', 'esm', 'cjs', 'build', 'built']);

/** @type {import('rollup').RollupOptions} */
const rollup = {
	input: {
		'options': './source/options.tsx',
		'welcome': './source/welcome.svelte',
		'header': './source/options/header.svelte',
		'storage-usage': './source/options/storage-usage.svelte',
		'background': './source/background.ts',
		'refined-github': './source/refined-github.ts',
		'content-script': './source/content-script.ts',
		'resolve-conflicts': './source/resolve-conflicts.ts',
	},
	output: {
		dir: 'distribution/assets',
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

	// TODO: Drop after https://github.com/sindresorhus/memoize/issues/102
	context: 'globalThis',

	plugins: [
		del({
			targets: ['distribution/assets'],
			runOnce: true, // `false` would be nice, but it deletes the files too early, causing two extension reloads
		}),
		lightning({
			options: {
				include: Features.Nesting,
				// Lighting issue: https://github.com/parcel-bundler/lightningcss/issues/826#issuecomment-2453982986
				targets: browserslistToTargets(browserslist('chrome 123, firefox 126, iOS 17.5')),
			},
		}),
		svelte(svelteConfig),
		json(),
		styles({
			mode: 'extract',
			url: false,
		}),
		string({
			include: '**/*.gql',
		}),
		alias({
			entries: [
				{find: 'react', replacement: 'dom-chef'},
			],
		}),
		sucrase({
			transforms: ['typescript', 'jsx'],

			// Output modern JS
			disableESTransforms: true,

			// Drop `__self` in JSX https://github.com/alangpierce/sucrase/issues/232#issuecomment-468898878
			production: true,
		}),
		resolve({browser: true}),
		commonjs(),
		copy({
			targets: [
				{src: './source/manifest.json', dest: 'distribution'},
				{src: './source/*.+(html|png)', dest: 'distribution/assets'},
			],
		}),
		cleanup(),
	],
};

if (process.env.RELATIVE_CI_STATS) {
	rollup.plugins.push(webpackStatsPlugin());
}

export default rollup;
