import {test, assert} from 'vitest';

import cleanPrCommitTitle from './pr-commit-cleaner.js';

test('cleanPrCommitTitle', () => {
	const clean = 'Something done';
	assert.equal(cleanPrCommitTitle('Something done (#123)', 123), clean);
	assert.equal(cleanPrCommitTitle('  Something done  (#123)  ', 123), clean);
	assert.equal(cleanPrCommitTitle(' Something done ', 123), clean);

	assert.notEqual(cleanPrCommitTitle('Something done (fixes #123)', 123), clean);
	assert.notEqual(cleanPrCommitTitle('Something done (#23454)', 123), clean);
});
