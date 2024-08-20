import {expect, test} from 'vitest';

import parseCompareUrl from './parse-compare-url.js';

const base = {
	branch: 'main',
	repo: {
		nameWithOwner: 'john/recipes',
	},
};

test('parseCompareUrl', () => {
	expect(parseCompareUrl('/john/recipes/compare')).toBe(undefined);
	expect(parseCompareUrl('/john/recipes/compare/main')).toBe(undefined);
	expect(parseCompareUrl('/john/recipes/compare/main...patch-1')).toMatchObject({
		base,
		head: {
			branch: 'patch-1',
			repo: {
				nameWithOwner: 'john/recipes',
			},
		},
		isCrossRepo: false,
	});
	expect(parseCompareUrl('/john/recipes/compare/main...patty:patch-1')).toMatchObject({
		base,
		head: {
			branch: 'patch-1',
			repo: {
				nameWithOwner: 'patty/recipes',
			},
		},
		isCrossRepo: true,
	});
	expect(parseCompareUrl('/john/recipes/compare/main...maria:ricette:pizza')).toMatchObject({
		base,
		head: {
			branch: 'pizza',
			repo: {
				nameWithOwner: 'maria/ricette',
			},
		},
		isCrossRepo: true,
	});
});
