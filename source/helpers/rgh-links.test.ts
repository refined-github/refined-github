import {assert, test} from 'vitest';

import {getFeatureRelatedIssuesQuery, getFeatureRelatedIssuesUrl} from './rgh-links.js';

test('getFeatureRelatedIssuesQuery', () => {
	assert.equal(getFeatureRelatedIssuesQuery('comment-excess'), 'is:open ("comment-excess")');
	assert.equal(
		getFeatureRelatedIssuesQuery('closing-remarks'),
		'is:open ("closing-remarks" OR "first-published-tag-for-merged-pr")',
	);
});

test('getFeatureRelatedIssuesUrl', () => {
	const url = getFeatureRelatedIssuesUrl('closing-remarks');

	assert.equal(url.pathname, '/refined-github/refined-github/issues');
	assert.equal(
		url.searchParams.get('q'),
		'is:open ("closing-remarks" OR "first-published-tag-for-merged-pr")',
	);
});
