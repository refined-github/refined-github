import {defineConfig} from 'vitest/config';
import {stringPlugin} from 'vite-string-plugin';

const noise = new Set(['index', 'dist', 'src', 'source', 'distribution', 'node_modules', 'main', 'esm', 'cjs', 'build', 'built']);

export default defineConfig({
	build: {
		outDir: 'distribution/assets',
		minify: false,
		cssCodeSplit: true,
		terserOptions: {
			compress: false,
			mangle: false,
		},
		lib: {
			entry: {
				'options': './source/options.tsx',
				'background': './source/background.ts',
				'refined-github': './source/refined-github.ts',
				'content-script': './source/content-script.ts',
				'resolve-conflicts': './source/resolve-conflicts.ts',
			},
			formats: ['es'],
		},
		rollupOptions: {
			output: {
				preserveModules: true,
				preserveModulesRoot: 'source',
				assetFileNames: '[name][extname]', // For CSS
				entryFileNames(chunkInfo) {
					if (chunkInfo.name.includes('node_modules')) {
						const cleanName = chunkInfo.name
							.split('/')
							.filter(part => !noise.has(part))
							.join('-');
						return `npm/${cleanName}.js`;
					}

					return chunkInfo.name.replace('build/__snapshots__/', '') + '.js';
				},
			},
		},
	},
	plugins: [
		stringPlugin({
			match: /\.gql$/,
		}),
	],
	test: {
		setupFiles: [
			'./test/setup-file.js',
		],
	},
	resolve: {
		alias: {
			react: 'dom-chef',
		},
	},
});
