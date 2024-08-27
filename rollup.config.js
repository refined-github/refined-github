import typescript from '@rollup/plugin-typescript';
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

const noise = new Set(['index', 'dist', 'src', 'source', 'distribution', 'node_modules', 'main', 'esm', 'cjs', 'build', 'built']);

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
		preserveModulesRoot: 'source',
		assetFileNames: '[name][extname]', // For CSS
		entryFileNames(chunkInfo) {
			if (chunkInfo.name.includes('node_modules')) {
				const cleanName = chunkInfo.name
					.split('/')
					.filter(part => !noise.has(part))
					.join('-');
				return `node_modules/${cleanName}.js`;
			}

			return chunkInfo.name.replace('build/__snapshots__/', '') + '.js';
		},
	},

	plugins: [
		del({
			targets: ['distribution/assets'],
			runOnce: true, // `false` would be nice, but it deletes the files too early, causing two extension reloads
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
		typescript({
			compilerOptions: {
				noEmitOnError: !process.env.ROLLUP_WATCH,
				module: 'Node16',
			},
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
