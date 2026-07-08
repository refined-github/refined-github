import {defineConfig} from 'vitest/config';

export default defineConfig({
	test: {
		environment: 'happy-dom',
		environmentOptions: {
			// eslint-disable-next-line @typescript-eslint/naming-convention
			happyDOM: {
				url: 'https://github.com',
			},
		},
	},
});
