import {assert, test} from 'vitest';

// @ts-expect-error JS only
import {navigateToCommits} from '../../test/fixtures/globals.js';
import getCurrentGitRef, {getGitRef} from './get-current-git-ref.js';

// The titles supplied here listed here are real, not guessed, except the error tester
test('getGitRef', () => {
	// Error testing
	assert.equal(getGitRef(
		'/',
		'some page title',
	), undefined, 'It should never throw with valid input');
	assert.throws(() => getGitRef(
		'https://github.com',
		'github.com',
	));

	// Root
	assert.equal(getGitRef(
		'/typescript-eslint/typescript-eslint',
		'typescript-eslint/typescript-eslint: Monorepo for all the tooling which enables ESLint to support TypeScript',
	), undefined);
	assert.equal(getGitRef(
		'/typescript-eslint/typescript-eslint/tree/chore/lerna-4',
		'typescript-eslint/typescript-eslint at chore/lerna-4',
	), 'chore/lerna-4');

	// Sub folder
	assert.equal(getGitRef(
		'/typescript-eslint/typescript-eslint/tree/master/docs',
		'typescript-eslint/docs at master · typescript-eslint/typescript-eslint',
	), 'master');
	assert.equal(getGitRef(
		'/typescript-eslint/typescript-eslint/tree/chore/lerna-4/docs',
		'typescript-eslint/docs at chore/lerna-4 · typescript-eslint/typescript-eslint',
	), 'chore/lerna-4');

	// Sub sub folder
	assert.equal(getGitRef(
		'/typescript-eslint/typescript-eslint/tree/master/docs/getting-started',
		'typescript-eslint/docs/getting-started at master · typescript-eslint/typescript-eslint',
	), 'master');
	assert.equal(getGitRef(
		'/typescript-eslint/typescript-eslint/tree/chore/lerna-4/docs/getting-started',
		'typescript-eslint/docs/getting-started at chore/lerna-4 · typescript-eslint/typescript-eslint',
	), 'chore/lerna-4');

	// File
	assert.equal(getGitRef(
		'/typescript-eslint/typescript-eslint/blob/master/docs/getting-started/README.md',
		'typescript-eslint/README.md at master · typescript-eslint/typescript-eslint',
	), 'master');
	assert.equal(getGitRef(
		'/typescript-eslint/typescript-eslint/blob/chore/lerna-4/docs/getting-started/README.md',
		'typescript-eslint/README.md at chore/lerna-4 · typescript-eslint/typescript-eslint',
	), 'chore/lerna-4');

	// Editing file
	assert.equal(getGitRef(
		'/typescript-eslint/typescript-eslint/edit/master/docs/getting-started/README.md',
		'Editing typescript-eslint/README.md at master · typescript-eslint/typescript-eslint',
	), 'master');
	assert.equal(getGitRef(
		'/typescript-eslint/typescript-eslint/edit/chore/lerna-4/docs/getting-started/README.md',
		'Editing typescript-eslint/README.md at chore/lerna-4 · typescript-eslint/typescript-eslint',
	), 'chore/lerna-4');

	// Blame
	assert.equal(getGitRef(
		'/typescript-eslint/typescript-eslint/blame/master/docs/getting-started/README.md',
		'typescript-eslint/docs/getting-started/README.md at master · typescript-eslint/typescript-eslint',
	), 'master');
	assert.equal(getGitRef(
		'/typescript-eslint/typescript-eslint/blame/chore/lerna-4/docs/getting-started/README.md',
		'typescript-eslint/docs/getting-started/README.md at chore/lerna-4 · typescript-eslint/typescript-eslint',
	), 'chore/lerna-4');

	// Single commit
	assert.equal(getGitRef(
		'/typescript-eslint/typescript-eslint/commit/795fd1c529ee58e97283c9ddf8463703517b50ab',
		'chore: add markdownlint (#1889) · typescript-eslint/typescript-eslint@795fd1c',
	), '795fd1c529ee58e97283c9ddf8463703517b50ab');

	// Branch includes period
	assert.equal(getGitRef(
		'/anggrayudi/SimpleStorage/tree/release/0.8.0',
		'anggrayudi/SimpleStorage at release/0.8.0',
	), 'release/0.8.0');

	assert.equal(getGitRef(
		'/ksh-code/repository/tree/h.l.o.o',
		'ksh-code/repository at h.l.o.o',
	), 'h.l.o.o');
});

// The titles supplied here listed here are real, not guessed, except the error tester
test('getCurrentGitRef', () => {
	// Commits
	navigateToCommits(
		'master',
		'/typescript-eslint/typescript-eslint/commits/master/docs/getting-started/README.md',
	);
	assert.equal(getCurrentGitRef(), 'master');

	navigateToCommits(
		'chore/lerna-4',
		'/typescript-eslint/typescript-eslint/commits/chore/lerna-4/docs/getting-started/README.md',
	);
	assert.equal(getCurrentGitRef(), 'chore/lerna-4');

	navigateToCommits(
		'this/branch/has/many/slashes',
		'/yakov116/TestR/commits/this/branch/has/many/slashes',
	);
	assert.equal(getCurrentGitRef(), 'this/branch/has/many/slashes');
});
