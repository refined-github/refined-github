import pMemoize from 'p-memoize';
import {test, assert, describe} from 'vitest';
import {parseHTML} from 'linkedom';
import filenamify from 'filenamify';
import {writeFile, mkdir, unlink, readFile, access} from 'node:fs/promises';

import * as exports from './selectors.js';

const fsCache = {
	async get(path: string): Promise<string | undefined> {
		try {
			const value = await readFile(path, 'utf8');
			return value;
		} catch {
			return undefined;
		}
	},
	async set(path: string, contents: string): Promise<void> {
		await mkdir('./test/.cache', {recursive: true});
		await writeFile(path, contents);
	},
	async has(path: string): Promise<boolean> {
		try {
			await access(path);
			return true;
		} catch {
			return false;
		}
	},
	async delete(path: string): Promise<void> {
		await unlink(path);
	},
} as const;

const fetchDocument = pMemoize(async (url: string): Promise<string> => {
	const request = await fetch(url, {
		headers: {
			Accept: 'text/html',
		},
	});
	return request.text();
}, {
	cacheKey: ([url]) => `./test/.cache/${filenamify(url.replace('https://github.com', ''))}.html`,
	cache: fsCache,
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
		const urls = exports[name + '_'] as exports.UrlMatch[];

		assert.isArray(urls, `No URLs defined for "${name}"`);
		await Promise.all(urls.map(async ([expectations, url]) => {
			const html = await fetchDocument(url);
			const {document} = parseHTML(html);
			// TODO: ? Use snapshot with outerHTML[]
			const matches = document.querySelectorAll(selector);
			assert.equal(matches.length, expectations, `Got wrong number of matches on ${url}:\n${selector}`);
		}));
	}, {timeout: 9999});
});
