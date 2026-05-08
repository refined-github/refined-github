import {assert, test} from 'vitest';

import isSquashMergeButtonText from './is-squash-merge-button-text.js';

test('isSquashMergeButtonText', () => {
	assert.isTrue(isSquashMergeButtonText('Confirm squash and merge'));
	assert.isTrue(isSquashMergeButtonText('Confirm auto-merge (squash)'));
	assert.isTrue(isSquashMergeButtonText('Confirm bypass rules and merge (squash)'));

	assert.isFalse(isSquashMergeButtonText('Confirm merge'));
	assert.isFalse(isSquashMergeButtonText('Confirm rebase and merge'));
	assert.isFalse(isSquashMergeButtonText(undefined));
});
