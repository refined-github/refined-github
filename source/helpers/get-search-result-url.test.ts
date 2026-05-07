import {describe, expect, it} from 'vitest';

import getSearchResultUrl from './get-search-result-url.js';

describe('getSearchResultUrl', () => {
	it('returns an absolute same-origin url from data-href', () => {
		const item = document.createElement('li');
		item.innerHTML = '<button class="ActionListItem" data-href="/refined-github/refined-github/blob/main/source/features/no-modals.tsx"></button>';

		expect(getSearchResultUrl(item)).toBe(`${location.origin}/refined-github/refined-github/blob/main/source/features/no-modals.tsx`);
	});

	it('ignores missing links', () => {
		expect(getSearchResultUrl(document.createElement('li'))).toBeUndefined();
	});

	it('ignores cross-origin links', () => {
		const item = document.createElement('li');
		item.innerHTML = '<button class="ActionListItem" data-href="https://example.com/refined-github/refined-github"></button>';

		expect(getSearchResultUrl(item)).toBeUndefined();
	});
});
