// @vitest-environment happy-dom

import mem from 'memoize';
import doma from 'doma';
import {test, assert, describe} from 'vitest';

import * as exports from './selectors.js';

const fetchDocument = mem(async (url: string): Promise<DocumentFragment> => {
	const request = await fetch(url);
	const contents = await request.text();
	return doma(contents);
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

			const document = await fetchDocument(url);
			// TODO: ? Use snapshot with outerHTML[]
			const matches = document.querySelectorAll(selector);
			if (expectations === undefined) {
				// TODO: Change to just be `1` instead, to be stricter
				assert(matches.length > 0, `Expected at least one match for "${name}" at ${url}`);
			} else {
				assert.lengthOf(matches, expectations, `Expected ${expectations} matches for "${name}" at ${url}`);
			}
		}));
	}, {timeout: 9999});
});
