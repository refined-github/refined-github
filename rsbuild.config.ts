import {defineConfig} from '@rsbuild/core';

export default defineConfig({
	source: {
		entry: {
			'options': './source/options.tsx',
			'background': './source/background.ts',
			'refined-github': './source/refined-github.ts',
			'content-script': './source/content-script.ts',
			'resolve-conflicts': './source/resolve-conflicts.ts',
		},
	},
	output: {
		distPath: {
			root: 'distribution/assets',
		},
	},
	performance: {
		chunkSplit: {
			strategy: 'split-by-module',
		},
	},
	tools: {
		rspack: {
			resolve: {
				alias: {
					react: 'dom-chef',
				},
				extensionAlias: {
					'.js': ['.tsx', '.ts', '.js'],
				},
			},
		},
	},
});
