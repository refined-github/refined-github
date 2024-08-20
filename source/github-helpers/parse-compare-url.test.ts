import {expect, test} from 'vitest';

import parseCompareUrl from './parse-compare-url.js';

test('parseCompareUrl', () => {
	expect(parseCompareUrl('/john/foo/compare/main...patty:patch-1')).toMatchObject({
		base: {
			branch: 'main',
			repo: {
				nameWithOwner: 'john/foo',
			},
		},
		head: {
			branch: 'patch-1',
			repo: {
				nameWithOwner: 'patty/foo',
			},
		},
		isCrossRepo: true,
	});
});
