import mem from 'mem';
import {test, assert} from 'vitest';
import {JSDOM} from 'jsdom';

import * as selectors from './selectors';

const fetchDocument = mem(async (url: string): Promise<JSDOM> => JSDOM.fromURL(url));

for (const [name, selector] of Object.entries(selectors)) {
	if (Array.isArray(selector)) {
		continue;
	}

	test(`Selector: ${selector}`, async () => {
		// @ts-expect-error Index signature bs
		const urls = selectors[name + '_'] as string[];

		assert.isArray(urls, `No URLs defined for "${name}"`);
		await Promise.all(urls.map(async url => {
			const {window} = await fetchDocument(url);
			assert.isDefined(window.document.querySelector(selector));
		}));
	});
}
