import mem from 'memoize';
import {test, assert, describe, expect} from 'vitest';
import {parseHTML} from 'linkedom';

import * as exports from './selectors.js';

const fetchDocument = mem(async (url: string): Promise<Window> => {
	const request = await fetch(url);
	const contents = await request.text();
	return parseHTML(contents);
});

describe.concurrent('selectors', () => {
	// Exclude URL arrays
	const selectors: Array<[name: string, selector: string]> = [];
	for (const [name, selector] of Object.entries(exports)) {
		if (!Array.isArray(selector)) {
			selectors.push([name, selector]);
		}
	}

	test.each(selectors)('%s', async (name, selector) => {
		// @ts-expect-error Index signature bs
		const urls = exports[name + '_'] as Array<string | [url: string, expectations: number]>;

		assert.isArray(urls, `No URLs defined for "${name}"`);
		await Promise.all(urls.map(async url => {
			let expectations: number | undefined;
			if (Array.isArray(url)) {
				[url, expectations] = url;
			}

			const {window} = await fetchDocument(url);
			// TODO: ? Use snapshot with outerHTML[]
			const matches = window.document.querySelectorAll(selector);
			if (expectations === undefined) {
				expect(matches).toBeGreaterThan(0);
			} else {
				expect(matches).toHaveLength(expectations);
			}
		}));
	}, {timeout: 9999});
});
