import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import cleanup from 'rollup-plugin-cleanup';
import styles from 'rollup-plugin-styles';
import {string} from 'rollup-plugin-string';
import alias from '@rollup/plugin-alias';
import json from '@rollup/plugin-json';

const rollup = {
	input: {
		options: './source/options.tsx',
		background: './source/background.ts',
		'refined-github': './source/refined-github.ts',
		'resolve-conflicts': './source/resolve-conflicts.ts',
	},
	output: {
		dir: 'distribution/assets',
		preserveModules: true,
		sssetFileNames: '[name]-[hash][extname]', // For CSS
	},

	external: [
		// Rollup is failing to parse the file as TypeScript 🤷‍♂️
		/types.d.ts/,
	],
	plugins: [
		json(),
		styles(),
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
		cleanup(),
	],
};

export default rollup;
