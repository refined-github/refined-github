import {test, assert} from 'vitest';

import {getConventionalCommitAndScope} from './render-conventional-commit-types.js';

test('getConventionalCommitAndScope', () => {
	assert.equal(getConventionalCommitAndScope('Commit message'), undefined);
	assert.equal(getConventionalCommitAndScope('fix: Commit message'), {type: 'fix', scope: undefined});
	assert.equal(getConventionalCommitAndScope('feat: Commit message'), {type: 'feat', scope: undefined});
	assert.equal(getConventionalCommitAndScope('feat(scope): Commit message'), {type: 'feat', scope: 'scope'});
	assert.equal(getConventionalCommitAndScope('feat(sco pe): Commit message'), {type: 'feat', scope: 'sco pe'});
	assert.equal(getConventionalCommitAndScope('feat(): Commit message'), undefined);
	assert.equal(getConventionalCommitAndScope('feat: Commit (message)'), {type: 'feat', scope: undefined});
	assert.equal(getConventionalCommitAndScope('fe at(scope): Commit message) '), undefined);
});
