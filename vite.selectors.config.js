import {playwright} from '@vitest/browser-playwright';
import {defineConfig} from 'vitest/config';

export default defineConfig({
	test: {
		include: [
			'./source/github-helpers/selectors.test.ts',
		],
		browser: {
			enabled: true,
			headless: true,
			provider: playwright(),
			instances: [
				{browser: 'chromium'},
			],
			commands: {
				async countSelector({provider, sessionId}, url, selector) {
					const {context} = provider.getCommandsContext(sessionId);
					const page = await context.newPage();
					try {
						await page.goto(url, {
							waitUntil: 'domcontentloaded',
							timeout: 30_000,
						});

						return await page.locator(selector).count();
					} finally {
						await page.close();
					}
				},
			},
		},
	},
});
