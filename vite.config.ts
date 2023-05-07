// eslint-disable-next-line n/file-extension-in-import -- No export map support
import {defineConfig} from 'vitest/config';

export default defineConfig({
	test: {
		setupFiles: [
			'./test/fixtures/globals.js',
		],
	},
});
