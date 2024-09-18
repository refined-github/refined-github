import {test, assert} from 'vitest';

import {parseConventionalCommit} from './conventional-commits.js';

test('parseConventionalCommit', () => {
	assert.deepStrictEqual(parseConventionalCommit('fix: Commit message'), ['fix: ', 'fix', undefined]);
	assert.deepStrictEqual(parseConventionalCommit('feat: Commit message'), ['feat: ', 'feat', undefined]);
	assert.deepStrictEqual(parseConventionalCommit('feat(scope): Commit message'), ['feat(scope): ', 'feat', 'scope']);
	assert.deepStrictEqual(parseConventionalCommit('feat(sco pe): Commit message'), ['feat(sco pe): ', 'feat', 'sco pe']);
	assert.deepStrictEqual(parseConventionalCommit(('feat: Commit (message)')), ['feat: ', 'feat', undefined]);

	assert.isUndefined(parseConventionalCommit('feat:'));
	assert.isUndefined(parseConventionalCommit('Commit message'));
	assert.isUndefined(parseConventionalCommit('feat(): Commit message'));
	assert.isUndefined(parseConventionalCommit('fe at(scope): Commit message) '));
});
