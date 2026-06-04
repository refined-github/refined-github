import {assert, test} from 'vitest';

import {shouldAppendWidgetToAnchor} from './conversation-activity-filter.js';

test('shouldAppendWidgetToAnchor', () => {
	const fixedIssueMetadata = document.createElement('div');
	fixedIssueMetadata.className = 'HeaderMetadata-module__metadataContent__abcde';

	const stickyIssueMetadata = document.createElement('div');
	stickyIssueMetadata.className =
		'HeaderMetadata-module__smallMetadataRow__abcde HeaderMetadata-module__smallMetadataRow_viewport__fghij';

	const legacyPullRequestMetadata = document.createElement('div');
	legacyPullRequestMetadata.className = 'flex-auto';

	assert.isTrue(shouldAppendWidgetToAnchor(fixedIssueMetadata));
	assert.isTrue(shouldAppendWidgetToAnchor(stickyIssueMetadata));
	assert.isFalse(shouldAppendWidgetToAnchor(legacyPullRequestMetadata));
});
