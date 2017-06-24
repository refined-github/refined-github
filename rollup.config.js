import nodeResolve from 'rollup-plugin-node-resolve';
import commonJS from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';

export default [
	'src/content.js',
	'src/background.js',
	'src/options/index.js'
].map(entry => ({
	entry,
	dest: entry.replace('src', 'extension'),
	plugins: [
		nodeResolve({
			browser: true,
			preferBuiltins: false
		}),
		commonJS(),
		json({
			preferConst: true
		})
	],
	format: 'iife',
	sourceMap: process.env.SOURCEMAP || false
}));
