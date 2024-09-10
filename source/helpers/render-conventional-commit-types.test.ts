import {test, assert} from 'vitest';

import {getConventionalCommitAndScopeMatch} from './render-conventional-commit-types.js';

function assertRegexDeepStrictEqual(input: string, expected: [string, string | undefined]) {
	const result = getConventionalCommitAndScopeMatch(input);
	assert.deepStrictEqual(result, [input, ...expected]);
}

test('getConventionalCommitAndScopeMatch', () => {
	assertRegexDeepStrictEqual('fix: Commit message', ['fix', undefined]);
	assertRegexDeepStrictEqual('feat: Commit message', ['feat', undefined]);
	assertRegexDeepStrictEqual('feat(scope): Commit message', ['feat', 'scope']);
	assertRegexDeepStrictEqual('feat(sco pe): Commit message', ['feat', 'sco pe']);
	assertRegexDeepStrictEqual(('feat: Commit (message)'), ['feat', undefined]);

	assert.isUndefined(getConventionalCommitAndScopeMatch('Commit message'));
	assert.isUndefined(getConventionalCommitAndScopeMatch('feat(): Commit message'));
	assert.isUndefined(getConventionalCommitAndScopeMatch('fe at(scope): Commit message) '));
});
