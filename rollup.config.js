import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import cleanup from 'rollup-plugin-cleanup';

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
	},
	plugins: [
		readmePlugin(),
		typescript({compilerOptions: {module: 'Node16'}}),
		resolve({browser: true}),
		commonjs(),
		cleanup(),
	],
};

export default rollup;
