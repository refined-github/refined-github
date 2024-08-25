import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import cleanup from 'rollup-plugin-cleanup';
import styles from 'rollup-plugin-styles';
import {string} from 'rollup-plugin-string';
import alias from '@rollup/plugin-alias';
import json from '@rollup/plugin-json';
import copy from 'rollup-plugin-copy';
import clear from 'rollup-plugin-clear';
import webpackStatsPlugin from 'rollup-plugin-webpack-stats';

/** @type {import('rollup').RollupOptions} */
const rollup = {
	input: {
		options: './source/options.tsx',
		background: './source/background.ts',
		'refined-github': './source/refined-github.ts',
		'content-script': './source/content-script.ts',
		'resolve-conflicts': './source/resolve-conflicts.ts',
	},
	output: {
		dir: 'distribution/assets',
		preserveModules: true,
		assetFileNames: '[name][extname]', // For CSS
	},
	plugins: [
		clear({
			targets: ['distribution/assets'],
			watch: false, // `true` would be nice, but it deletes the files too early, causing two extension reloads
		}),
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
		typescript({compilerOptions: {module: 'Node16'}}),
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
