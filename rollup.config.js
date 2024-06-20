import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import cleanup from 'rollup-plugin-cleanup';
import styles from 'rollup-plugin-styles';
import {string} from 'rollup-plugin-string';
import alias from '@rollup/plugin-alias';
import json from '@rollup/plugin-json';

import readmePlugin from './build/readme.plugin.js';

const rollup = {
	input: {
		options: './source/options.tsx',
		background: './source/background.ts',
		'refined-github': './source/refined-github.ts',
		'resolve-conflicts': './source/resolve-conflicts.ts',
	},
	output: {
		dir: 'distribution/assets',
		// AssetFileNames: "[name]-[hash][extname]", // for CSS
	},
	plugins: [
		json(), // TODO: Drop after https://github.com/refined-github/shorten-repo-url/issues/47
		styles(),
		string({
			include: '**/*.gql',
		}),
		alias({
			entries: [
				{find: 'react', replacement: 'dom-chef'},
				{find: '@cheap-glitch/mi-cron', replacement: '@cheap-glitch/mi-cron/index.min.js'},
			],
		}),
		readmePlugin(),
		typescript({compilerOptions: {module: 'Node16'}}),
		resolve({browser: true}),
		commonjs(),
		cleanup(),
	],
};

export default rollup;
