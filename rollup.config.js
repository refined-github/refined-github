import path from 'path';
import alias from '@rollup/plugin-alias';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import postcss from 'rollup-plugin-postcss';
import { terser } from 'rollup-plugin-terser';
import typescript from '@rollup/plugin-typescript';

const production = !process.env.ROLLUP_WATCH;
const svgDom = {
	name: "octicon",
	transform(source, filename) {
		if (!filename.endsWith('.svg')) {
			return;
		}
		const iconName = path.basename(filename, 'svg');
		const svgWithClass = source.replace(
			'<svg',
			`<svg class="octicon octicon-${iconName}"`
		);
		const code = `
		import doma from 'doma';
		export default () => doma.one('${svgWithClass.replace('\'', '\\\'')}')`;
		return {
			code
		};
	}
};

export default [
	'source/refined-github.ts',
	'source/background.ts',
	'source/resolve-conflicts.ts',
	'source/options.tsx',
].map(input => ({
	input,
	output: {
		dir: 'output',
		format: 'iife',
		sourcemap: !production
	},
	plugins: [
		svgDom,
		alias({
			entries: {
				octicon: '@primer/octicons/build/svg'
			}
		}),
		postcss({
			extract: true,
		}),
		json(),
		typescript(),
		resolve(),
		commonjs(),
		production && terser({
			mangle: false,
			compress: {
				defaults: false,
				dead_code: true,
				unused: true,
				arguments: true,
				join_vars: false,
				booleans: false,
				expression: false,
				sequences: false
			},
			output: {
				beautify: true,
				indent_level: 2
			}
		}) // minify, but only in production
	]
}));