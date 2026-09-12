import {defineConfig} from 'vitest/config';

export default defineConfig({
	test: {
		environment: 'happy-dom',
		pool: 'vmThreads', // https://vitest.dev/guide/improving-performance#test-environments
		environmentOptions: {
			// eslint-disable-next-line @typescript-eslint/naming-convention
			happyDOM: {
				url: 'https://github.com',
			},
		},
	},
});
