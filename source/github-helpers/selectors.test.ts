import {commands} from 'vitest/browser';
import {assert, describe, test} from 'vitest';

import * as exports from './selectors.js';

declare module 'vitest/internal/browser' {
	interface BrowserCommands {
		countSelector(url: string, selector: string): Promise<number>;
	}
}

describe('selectors', () => {
	// Exclude URL arrays
	const selectors: Array<[name: string, selector: string]> = [];
	for (const [name, selector] of Object.entries(exports)) {
		if (!name.endsWith('_')) {
			selectors.push([name, String(selector)]);
		}
	}

	test.each(selectors)('%s', {timeout: 60_000}, async (name, selector: string) => {
		// @ts-expect-error Index signature bs

		const urls = exports[name + '_'] as exports.UrlMatch[];

		assert.isArray(urls, `No URLs defined for "${name}"`);
		const results: Array<{expectations: number; url: string; matches: number}> = [];
		for (const [expectations, url] of urls) {
			results.push({
				expectations,
				url,
				// eslint-disable-next-line no-await-in-loop -- Sequential requests are required to avoid throttling
				matches: await commands.countSelector(url, selector),
			});
		}

		for (const {expectations, url, matches} of results) {
			if (expectations === 0) {
				assert.equal(matches, 0, `Got wrong number of matches on ${url}:\n${selector}`);
			} else {
				assert.isAtLeast(matches, expectations, `Got too few matches on ${url}:\n${selector}`);
			}
		}
	});
});
