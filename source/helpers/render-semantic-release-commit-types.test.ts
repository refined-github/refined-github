import {test, assert} from 'vitest';

import {getSemanticCommitAndScope} from './render-semantic-release-commit-types.js';

test('getSemanticCommitAndScope', () => {
	assert.equal(getSemanticCommitAndScope('Commit message'), undefined);
	assert.equal(getSemanticCommitAndScope('fix: Commit message'), ['fix']);
	assert.equal(getSemanticCommitAndScope('feat: Commit message'), ['feat']);
	assert.equal(getSemanticCommitAndScope('feat(scope): Commit message'), ['feat', 'scope']);
	assert.equal(getSemanticCommitAndScope('feat(sco pe): Commit message'), ['feat', 'sco pe']);
	assert.equal(getSemanticCommitAndScope('feat(): Commit message'), ['feat']);
	assert.equal(getSemanticCommitAndScope('feat: Commit (message)'), ['feat']);
	assert.equal(getSemanticCommitAndScope('fe at(scope): Commit message) '), [undefined, 'scope']);
});
