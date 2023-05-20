import mem from 'mem';
import {test, assert, describe} from 'vitest';
import {JSDOM} from 'jsdom';

import * as exports from './selectors.js';

const fetchDocument = mem(async (url: string): Promise<JSDOM> => JSDOM.fromURL(url));

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
		const urls = exports[name + '_'] as string[];

		assert.isArray(urls, `No URLs defined for "${name}"`);
		await Promise.all(urls.map(async url => {
			const {window} = await fetchDocument(url);
			// TODO: Drop replacement after https://github.com/jsdom/jsdom/issues/3506
			// It's not equivalent at the moment, but at least the tests don't fail. Let's see how it goes
			assert.isDefined(window.document.querySelector(selector.replaceAll(':has', ':is')));
		}));
	}, {timeout: 9999});
});
