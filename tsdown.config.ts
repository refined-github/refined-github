import {string} from 'rollup-plugin-string';
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

const plugins = [
	svelte(svelteConfig),
	string({include: '**/*.gql'}),
	...(process.env.RELATIVE_CI_STATS ? [webpackStatsPlugin()] : []),
];

const copy = [
	{from: './source/manifest.json', to: 'distribution'},
	{from: './source/*.+(html|png)', to: 'distribution/assets'},
];
const shared = {
	deps: {onlyBundle: false},
	unbundle: true,
	root: 'source',
	inputOptions: {
		resolve: {alias: {react: 'dom-chef'}},
	},
	outDir: 'distribution/assets',
	outputOptions: {
		entryFileNames(chunkInfo) {
			if (chunkInfo.name.includes('node_modules')) {
				const cleanName = chunkInfo.name
					.split('/')
					.filter((part) => !noise.has(part))
					.join('-');
				return `npm/${cleanName}.js`;
			}

			return chunkInfo.name.replace('build/__snapshots__/', '') + '.js';
		},
		assetFileNames(chunkInfo) {
			if (chunkInfo.names?.[0]?.endsWith('.css')) {
				return (
					chunkInfo.originalFileNames?.[0]
						?.replace(/^source\//, '')
						?.replace(/\.(svelte|tsx?|jsx?)$/, '.css') ?? '[name].css'
				);
			}

			return '[name][extname]';
		},
	},

	css: {
		target: false, // Preserve modern CSS syntax
		splitting: false,
	},
	context: 'globalThis',
	onwarn(warning, defaultHandler) {
		if (
			warning.code === 'CIRCULAR_DEPENDENCY'
			&& warning.ids?.every((id) => id.includes('/svelte/'))
		) {
			return;
		}
		defaultHandler(warning);
	},
	plugins,
} satisfies Parameters<typeof defineConfig>[0][number];

export default defineConfig([
	{...shared, copy, entry: {options: './source/options.tsx'}},
	{...shared, entry: {welcome: './source/welcome.svelte'}},
	{...shared, entry: {graphql: './source/graphql.svelte'}},
	{...shared, entry: {header: './source/options/header.svelte'}},
	{
		...shared,
		entry: {'storage-usage': './source/options/storage-usage.svelte'},
	},
	{
		...shared,
		entry: {'version-info': './source/options/version-info.svelte'},
	},
	{...shared, entry: {background: './source/background.ts'}},
	{...shared, entry: {'refined-github': './source/refined-github.ts'}},
	{...shared, entry: {'content-script': './source/content-script.ts'}},
]);
