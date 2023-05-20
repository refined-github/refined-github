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
			// TODO: Drop replacements after https://github.com/jsdom/jsdom/issues/3506
			assert.isDefined(window.document.querySelector(selector.replaceAll(':has', ':matches')));
		}));
	}, {timeout: 9999});
});
