import nodeResolve from 'rollup-plugin-node-resolve';
import commonJS from 'rollup-plugin-commonjs';

export default [
	'src/content.js',
	'src/background.js',
	'src/options/index.js'
].map(entry => ({
	entry,
	dest: entry.replace('src', 'extension'),
	plugins: [
		nodeResolve({
			browser: true
		}),
		commonJS()
	],
	format: 'iife'
}));
