import test from 'ava';

import './fixtures/globals';
import {getCurrentCommittish} from '../source/github-helpers';

// The titles supplied here listed here are real, not guessed, except the error tester
test('getCurrentCommittish', t => {
	// Error testing
	t.is(getCurrentCommittish(
		'/',
		'some page title',
	), undefined, 'It should never throw with valid input');
	t.throws(() => getCurrentCommittish(
		'https://github.com',
		'github.com',
	));

	// Root
	t.is(getCurrentCommittish(
		'/typescript-eslint/typescript-eslint',
		'typescript-eslint/typescript-eslint: Monorepo for all the tooling which enables ESLint to support TypeScript',
	), undefined);
	t.is(getCurrentCommittish(
		'/typescript-eslint/typescript-eslint/tree/chore/lerna-4',
		'typescript-eslint/typescript-eslint at chore/lerna-4',
	), 'chore/lerna-4');

	// Sub folder
	t.is(getCurrentCommittish(
		'/typescript-eslint/typescript-eslint/tree/master/docs',
		'typescript-eslint/docs at master · typescript-eslint/typescript-eslint',
	), 'master');
	t.is(getCurrentCommittish(
		'/typescript-eslint/typescript-eslint/tree/chore/lerna-4/docs',
		'typescript-eslint/docs at chore/lerna-4 · typescript-eslint/typescript-eslint',
	), 'chore/lerna-4');

	// Sub sub folder
	t.is(getCurrentCommittish(
		'/typescript-eslint/typescript-eslint/tree/master/docs/getting-started',
		'typescript-eslint/docs/getting-started at master · typescript-eslint/typescript-eslint',
	), 'master');
	t.is(getCurrentCommittish(
		'/typescript-eslint/typescript-eslint/tree/chore/lerna-4/docs/getting-started',
		'typescript-eslint/docs/getting-started at chore/lerna-4 · typescript-eslint/typescript-eslint',
	), 'chore/lerna-4');

	// File
	t.is(getCurrentCommittish(
		'/typescript-eslint/typescript-eslint/blob/master/docs/getting-started/README.md',
		'typescript-eslint/README.md at master · typescript-eslint/typescript-eslint',
	), 'master');
	t.is(getCurrentCommittish(
		'/typescript-eslint/typescript-eslint/blob/chore/lerna-4/docs/getting-started/README.md',
		'typescript-eslint/README.md at chore/lerna-4 · typescript-eslint/typescript-eslint',
	), 'chore/lerna-4');

	// Editing file
	t.is(getCurrentCommittish(
		'/typescript-eslint/typescript-eslint/edit/master/docs/getting-started/README.md',
		'Editing typescript-eslint/README.md at master · typescript-eslint/typescript-eslint',
	), 'master');
	t.is(getCurrentCommittish(
		'/typescript-eslint/typescript-eslint/edit/chore/lerna-4/docs/getting-started/README.md',
		'Editing typescript-eslint/README.md at chore/lerna-4 · typescript-eslint/typescript-eslint',
	), 'chore/lerna-4');

	// Blame
	t.is(getCurrentCommittish(
		'/typescript-eslint/typescript-eslint/blame/master/docs/getting-started/README.md',
		'typescript-eslint/docs/getting-started/README.md at master · typescript-eslint/typescript-eslint',
	), 'master');
	t.is(getCurrentCommittish(
		'/typescript-eslint/typescript-eslint/blame/chore/lerna-4/docs/getting-started/README.md',
		'typescript-eslint/docs/getting-started/README.md at chore/lerna-4 · typescript-eslint/typescript-eslint',
	), 'chore/lerna-4');

	// Commits
	t.is(getCurrentCommittish(
		'/typescript-eslint/typescript-eslint/commits/master/docs/getting-started/README.md',
		'History for docs/getting-started/README.md - typescript-eslint/typescript-eslint',
	), 'master');
	t.is(getCurrentCommittish(
		'/typescript-eslint/typescript-eslint/commits/chore/lerna-4/docs/getting-started/README.md',
		'History for docs/getting-started/README.md - typescript-eslint/typescript-eslint',
	), 'chore'); // Wrong, but

	// Single commit
	t.is(getCurrentCommittish(
		'/typescript-eslint/typescript-eslint/commit/795fd1c529ee58e97283c9ddf8463703517b50ab',
		'chore: add markdownlint (#1889) · typescript-eslint/typescript-eslint@795fd1c',
	), '795fd1c529ee58e97283c9ddf8463703517b50ab');

	// Branch includes period
	t.is(getCurrentCommittish(
		'/anggrayudi/SimpleStorage/tree/release/0.8.0',
		'anggrayudi/SimpleStorage at release/0.8.0',
	), 'release/0.8.0');

	t.is(getCurrentCommittish(
		'/ksh-code/repository/tree/h.l.o.o',
		'ksh-code/repository at h.l.o.o',
	), 'h.l.o.o');
});
