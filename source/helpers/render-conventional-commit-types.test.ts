import {test, assert} from 'vitest';

import {getConventionalCommitAndScope} from './render-conventional-commit-types.js';

test('getConventionalCommitAndScope', () => {
	assert.isUndefined(getConventionalCommitAndScope('Commit message'));
	assert.deepEqual(getConventionalCommitAndScope('fix: Commit message'), {type: 'fix', scope: undefined});
	assert.deepEqual(getConventionalCommitAndScope('feat: Commit message'), {type: 'feat', scope: undefined});
	assert.deepEqual(getConventionalCommitAndScope('feat(scope): Commit message'), {type: 'feat', scope: 'scope'});
	assert.deepEqual(getConventionalCommitAndScope('feat(sco pe): Commit message'), {type: 'feat', scope: 'sco pe'});
	assert.isUndefined(getConventionalCommitAndScope('feat(): Commit message'));
	assert.deepEqual(getConventionalCommitAndScope('feat: Commit (message)'), {type: 'feat', scope: undefined});
	assert.isUndefined(getConventionalCommitAndScope('fe at(scope): Commit message) '));
});
