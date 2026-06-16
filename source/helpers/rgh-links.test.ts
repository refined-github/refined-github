import {assert, test} from 'vitest';

import {getFeatureRelatedIssuesQuery, getFeatureRelatedIssuesUrl} from './rgh-links.js';

test('getFeatureRelatedIssuesQuery', () => {
	assert.equal(getFeatureRelatedIssuesQuery('last-update-order'), 'state:open "last-update-order"');
	assert.equal(
		getFeatureRelatedIssuesQuery('closing-remarks'),
		'state:open ("closing-remarks" OR "first-published-tag-for-merged-pr")',
	);
});

test('getFeatureRelatedIssuesUrl', () => {
	const url = getFeatureRelatedIssuesUrl('closing-remarks');

	assert.equal(url.pathname, '/refined-github/refined-github/issues');
	assert.equal(
		url.searchParams.get('q'),
		'state:open ("closing-remarks" OR "first-published-tag-for-merged-pr")',
	);
});
