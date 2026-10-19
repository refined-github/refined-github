/* eslint-disable jsdoc/imports-as-dependencies -- False positive */
import path from 'node:path';
import process from 'node:process';
import svelte from 'rollup-plugin-svelte';
import webpackStatsPlugin from 'rollup-plugin-webpack-stats';
import {defineConfig} from 'tsdown';

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

const js = [
	'./source/options.tsx',
	'./source/welcome.svelte',
	'./source/graphql.svelte',
	'./source/refined-github.ts',
	'./source/content-script.js', // Entry-point only, not evaluated
	'./source/background.ts',
].map(filepath => [path.parse(filepath).name, filepath]);

const css = [
	'./source/options.tsx',
	'./source/refined-github.ts',
].map(filepath => [path.parse(filepath).name, filepath]);

/** @type {import('tsdown').UserConfig} */
const shared = {
	platform: 'browser',
	format: 'es',
	outDir: 'distribution/assets',
	dts: false,
	hash: false,
	fixedExtension: false,
	deps: {alwaysBundle: [/.*/], onlyBundle: false},
	alias: {react: 'dom-chef'},
	loader: {'.gql': 'text', '.svg': 'text'},
	inputOptions: {
		// Better conditions for Svelte
		resolve: {conditionNames: ['production', 'browser', 'module', 'import', 'default']},
		transform: {jsx: {runtime: 'classic'}},
	},
	outputOptions: {
		entryFileNames(chunkInfo) {
			if (chunkInfo.name.includes('node_modules')) {
				return 'npm/' + chunkInfo.name.split('/').filter(part => !noise.has(part)).join('-') + '.js';
			}

			return chunkInfo.name.replace('build/__snapshots__/', '') + '.js';
		},
	},
	target: false,
	clean: false,
};

// Drop the files that the other builds are responsible for
const keep = predicate => ({
	name: 'keep-only',
	generateBundle: {
		order: 'post', // After the CSS plugin
		handler(_, bundle) {
			for (const [fileName, file] of Object.entries(bundle)) {
				if (!predicate(file)) {
					delete bundle[fileName];
				}
			}
		},
	},
});

// eslint-disable-next-line unicorn/no-top-level-side-effects -- TODO: https://github.com/sindresorhus/eslint-plugin-unicorn/pull/3893
export default defineConfig([
	{
		...shared,
		entry: Object.fromEntries(js),
		unbundle: true,
		root: 'source',
		clean: true,
		copy: [
			{from: 'source/manifest.json', to: 'distribution'},
			{from: 'source/*.{html,png,js}', to: 'distribution/assets'},
		],
		plugins: [
			svelte(svelteConfig),
			process.env.RELATIVE_CI_STATS ? webpackStatsPlugin() : undefined,
			keep(file => !file.fileName.endsWith('.css')),
		],
	},
	...css.map(([name, entry]) => ({
		...shared,
		entry,
		css: {
			splitting: false,
			fileName: name + '.css',
		},
		plugins: [svelte(svelteConfig), keep(file => file.fileName.endsWith('.css'))],
	})),
]);
