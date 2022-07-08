import {expect, test} from 'vitest';

import './fixtures/globals';
import {getCurrentCommittish} from '../source/github-helpers';

// The titles supplied here listed here are real, not guessed, except the error tester
test('getCurrentCommittish', () => {
	// Error testing
	expect(getCurrentCommittish(
		'/',
		'some page title',
	)).toBe(undefined);
	expect(() => getCurrentCommittish(
		'https://github.com',
		'github.com',
	)).toThrow();

	// Root
	expect(getCurrentCommittish(
		'/typescript-eslint/typescript-eslint',
		'typescript-eslint/typescript-eslint: Monorepo for all the tooling which enables ESLint to support TypeScript',
	)).toBe(undefined);
	expect(getCurrentCommittish(
		'/typescript-eslint/typescript-eslint/tree/chore/lerna-4',
		'typescript-eslint/typescript-eslint at chore/lerna-4',
	)).toBe('chore/lerna-4');

	// Sub folder
	expect(getCurrentCommittish(
		'/typescript-eslint/typescript-eslint/tree/master/docs',
		'typescript-eslint/docs at master · typescript-eslint/typescript-eslint',
	)).toBe('master');
	expect(getCurrentCommittish(
		'/typescript-eslint/typescript-eslint/tree/chore/lerna-4/docs',
		'typescript-eslint/docs at chore/lerna-4 · typescript-eslint/typescript-eslint',
	)).toBe('chore/lerna-4');

	// Sub sub folder
	expect(getCurrentCommittish(
		'/typescript-eslint/typescript-eslint/tree/master/docs/getting-started',
		'typescript-eslint/docs/getting-started at master · typescript-eslint/typescript-eslint',
	)).toBe('master');
	expect(getCurrentCommittish(
		'/typescript-eslint/typescript-eslint/tree/chore/lerna-4/docs/getting-started',
		'typescript-eslint/docs/getting-started at chore/lerna-4 · typescript-eslint/typescript-eslint',
	)).toBe('chore/lerna-4');

	// File
	expect(getCurrentCommittish(
		'/typescript-eslint/typescript-eslint/blob/master/docs/getting-started/README.md',
		'typescript-eslint/README.md at master · typescript-eslint/typescript-eslint',
	)).toBe('master');
	expect(getCurrentCommittish(
		'/typescript-eslint/typescript-eslint/blob/chore/lerna-4/docs/getting-started/README.md',
		'typescript-eslint/README.md at chore/lerna-4 · typescript-eslint/typescript-eslint',
	)).toBe('chore/lerna-4');

	// Editing file
	expect(getCurrentCommittish(
		'/typescript-eslint/typescript-eslint/edit/master/docs/getting-started/README.md',
		'Editing typescript-eslint/README.md at master · typescript-eslint/typescript-eslint',
	)).toBe('master');
	expect(getCurrentCommittish(
		'/typescript-eslint/typescript-eslint/edit/chore/lerna-4/docs/getting-started/README.md',
		'Editing typescript-eslint/README.md at chore/lerna-4 · typescript-eslint/typescript-eslint',
	)).toBe('chore/lerna-4');

	// Blame
	expect(getCurrentCommittish(
		'/typescript-eslint/typescript-eslint/blame/master/docs/getting-started/README.md',
		'typescript-eslint/docs/getting-started/README.md at master · typescript-eslint/typescript-eslint',
	)).toBe('master');
	expect(getCurrentCommittish(
		'/typescript-eslint/typescript-eslint/blame/chore/lerna-4/docs/getting-started/README.md',
		'typescript-eslint/docs/getting-started/README.md at chore/lerna-4 · typescript-eslint/typescript-eslint',
	)).toBe('chore/lerna-4');

	// Commits
	expect(getCurrentCommittish(
		'/typescript-eslint/typescript-eslint/commits/master/docs/getting-started/README.md',
		'History for docs/getting-started/README.md - typescript-eslint/typescript-eslint',
	)).toBe('master');
	expect(getCurrentCommittish(
		'/typescript-eslint/typescript-eslint/commits/chore/lerna-4/docs/getting-started/README.md',
		'History for docs/getting-started/README.md - typescript-eslint/typescript-eslint',
	)).toBe('chore/lerna-4');
	expect(getCurrentCommittish(
		'/yakov116/TestR/commits/this/branch/has/many/slashes',
		'Commits · yakov116/TestR',
	)).toBe('this/branch/has/many/slashes');

	// Single commit
	expect(getCurrentCommittish(
		'/typescript-eslint/typescript-eslint/commit/795fd1c529ee58e97283c9ddf8463703517b50ab',
		'chore: add markdownlint (#1889) · typescript-eslint/typescript-eslint@795fd1c',
	)).toBe('795fd1c529ee58e97283c9ddf8463703517b50ab');

	// Branch includes period
	expect(getCurrentCommittish(
		'/anggrayudi/SimpleStorage/tree/release/0.8.0',
		'anggrayudi/SimpleStorage at release/0.8.0',
	)).toBe('release/0.8.0');

	expect(getCurrentCommittish(
		'/ksh-code/repository/tree/h.l.o.o',
		'ksh-code/repository at h.l.o.o',
	)).toBe('h.l.o.o');
});
