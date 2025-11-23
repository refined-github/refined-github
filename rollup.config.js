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

// AI-generated
// TODO: clean up

// Define inputs
const inputs = {
	options: './source/options.tsx',
	welcome: './source/welcome.svelte',
	header: './source/options/header.svelte',
	'storage-usage': './source/options/storage-usage.svelte',
	background: './source/background.ts',
	'refined-github': './source/refined-github.ts',
	'content-script': './source/content-script.ts',
	'resolve-conflicts': './source/resolve-conflicts.ts',
	// 'messages' is extracted to a separate config below
};

const messagesInput = {
	messages: './source/messages.ts',
};

// Shared plugin generator to ensure fresh instances for each build
const getPlugins = ({ isMainBuild } = {}) => {
	const plugins = [
		// Only run delete on the main build to avoid race conditions
		isMainBuild && del({
			targets: ['distribution/assets'],
			runOnce: true,
		}),
		lightning({
			options: {
				include: Features.Nesting,
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
			disableESTransforms: true,
			production: true,
		}),
		resolve({browser: true}),
		commonjs(),
		// Only run copy on the main build
		isMainBuild && copy({
			targets: [
				{src: './source/manifest.json', dest: 'distribution'},
				{src: './source/*.+(html|png)', dest: 'distribution/assets'},
			],
		}),
		cleanup(),
	];

	// Filter out conditional false values
	const validPlugins = plugins.filter(Boolean);

	if (process.env.RELATIVE_CI_STATS) {
		validPlugins.push(webpackStatsPlugin());
	}

	return validPlugins;
};

/** @type {import('rollup').RollupOptions[]} */
export default [
	// Config 1: Main build (Preserve Modules)
	{
		input: inputs,
		output: {
			dir: 'distribution/assets',
			preserveModules: true,
			preserveModulesRoot: 'source',
			assetFileNames: '[name][extname]',
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
		watch: { clearScreen: false },
		context: 'globalThis',
		plugins: getPlugins({ isMainBuild: true }),
	},
	// Config 2: Messages build (Bundled)
	{
		input: messagesInput,
		output: {
			dir: 'distribution/assets',
			// preserveModules is false by default, creating a bundle
			entryFileNames: '[name].js',
			assetFileNames: '[name][extname]',
		},
		watch: { clearScreen: false },
		context: 'globalThis',
		plugins: getPlugins({ isMainBuild: false }),
	}
];
