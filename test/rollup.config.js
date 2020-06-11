import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';

// eslint-disable-next-line import/no-anonymous-default-export
export default {
	plugins: [
		// CommonJS configuration required to support `import x = require('x')` in tested files and maintain compatibility with Node
		typescript({module: 'CommonJS'}),
		commonjs({extensions: ['.ts', '.tsx']})
	],
	output: {
		dir: '.built/test',
		entryFileNames: '[name].mjs',
		chunkFileNames: '_.mjs'
	}
};
