/* eslint-disable @typescript-eslint/explicit-function-return-type */
import {resolve} from 'node:path';
import {defineConfig} from 'vitest/config';

function readmeParser() {
	return {
		name: 'readme-parser',
		async load(id) {
			if (!id.endsWith('readme.md')) {
				return null;
			}

			const {getImportedFeatures, getFeaturesMeta} = await import('./build/readme-parser.js');
			return `
				export const importedFeatures = ${JSON.stringify(getImportedFeatures())};
				export const featuresMeta = ${JSON.stringify(getFeaturesMeta())};
			`;
		},
	};
}

export default defineConfig({
	plugins: [
		readmeParser(),
	],
	build: {
		target: 'es2022',
		minify: "terser",
		terserOptions: {
			mangle: false,
			compress: {
				sequences: false,
				conditionals: false,
			},
			output: {
				beautify: true,
				indent_level: 2,
			},
		},

		rollupOptions: {
			input: {
				'refined-github': './source/refined-github.ts',
			},
		},
	},
	test: {
		setupFiles: [
			'./test/fixtures/globals.js',
		],
	},
});
