import {test, assert} from 'vitest';

import {parseConventionalCommit} from './conventional-commits.js';

function assertRegexDeepStrictEqual(input: string, expected: [string, string | undefined]) {
	const result = parseConventionalCommit(input);
	assert.deepStrictEqual(result, [input, ...expected]);
}

test('parseConventionalCommit', () => {
	assertRegexDeepStrictEqual('fix: Commit message', ['fix', undefined]);
	assertRegexDeepStrictEqual('feat: Commit message', ['feat', undefined]);
	assertRegexDeepStrictEqual('feat(scope): Commit message', ['feat', 'scope']);
	assertRegexDeepStrictEqual('feat(sco pe): Commit message', ['feat', 'sco pe']);
	assertRegexDeepStrictEqual(('feat: Commit (message)'), ['feat', undefined]);

	assert.isUndefined(parseConventionalCommit('feat:'));
	assert.isUndefined(parseConventionalCommit('Commit message'));
	assert.isUndefined(parseConventionalCommit('feat(): Commit message'));
	assert.isUndefined(parseConventionalCommit('fe at(scope): Commit message) '));
});
