import mem from 'memoize';
import {test, assert, describe} from 'vitest';
import {DOMParser} from 'linkedom';
import filenamify from 'filenamify';
import {writeFile, mkdir} from 'node:fs/promises';

import * as exports from './selectors.js';

const fetchDocument = mem(async (url: string): Promise<Document> => {
	const request = await fetch(url, {
		headers: {
			Accept: 'text/html',
		},
	});
	const contents = await request.text();
	void storeHtmlLocallyForReview(url, contents);

	return new DOMParser().parseFromString(contents, 'text/html') as unknown as Document;
});

async function storeHtmlLocallyForReview(url: string, html: string): Promise<void> {
	await mkdir('./test/.cache', {recursive: true});
	await writeFile(`./test/.cache/${filenamify(url)}`, html);
}

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
				assert(matches.length > 0, `Expected at least one match for \`${selector}\` at ${url}`);
			} else {
				assert.lengthOf(matches, expectations, `Expected ${expectations} matches for \`${selector}\` at ${url}`);
			}
		}));
	}, {timeout: 9999});
});
