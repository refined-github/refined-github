import {defineConfig} from 'vitest/config';

export default defineConfig({
	resolve: {
		alias: {
			'dom-chef': 'jsx-dom',
		},
	},
	test: {
		setupFiles: [
			'./test/setup-file.js',
		],
	},
});
