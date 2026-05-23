import {configDefaults, defineConfig} from 'vitest/config';

export default defineConfig({
	test: {
		setupFiles: [
			'./test/setup-file.js',
		],
		exclude: [
			...configDefaults.exclude,
			'./source/github-helpers/selectors.test.ts',
		],
	},
});
