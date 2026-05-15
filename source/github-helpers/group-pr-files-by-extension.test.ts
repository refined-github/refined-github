import {assert, test} from 'vitest';

import {getExtensionGroupLabelFromPath, groupPullRequestFilesByExtension} from './group-pr-files-by-extension.js';

test('getExtensionGroupLabelFromPath', () => {
	assert.equal(getExtensionGroupLabelFromPath('src/foo.ts'), '.ts');
	assert.equal(getExtensionGroupLabelFromPath('README.md'), '.md');
	assert.equal(getExtensionGroupLabelFromPath('Dockerfile'), 'No extension');
	assert.equal(getExtensionGroupLabelFromPath('Makefile'), 'No extension');
	assert.equal(getExtensionGroupLabelFromPath('.gitignore'), '.gitignore');
	assert.equal(getExtensionGroupLabelFromPath('foo/.env'), '.env');
	assert.equal(getExtensionGroupLabelFromPath('foo.d.ts'), '.ts');
	assert.equal(getExtensionGroupLabelFromPath('.foo.bar'), '.bar');
});

test('groupPullRequestFilesByExtension aggregates and sorts', () => {
	const {rows, zeroLineFileCount} = groupPullRequestFilesByExtension([
		{filename: 'a.ts', additions: 10, deletions: 5},
		{filename: 'b.ts', additions: 1, deletions: 0},
		{filename: 'c.tsx', additions: 100, deletions: 0},
		{filename: 'image.png', additions: 0, deletions: 0},
	]);

	assert.equal(zeroLineFileCount, 1);
	assert.deepEqual(rows, [
		{label: '.tsx', additions: 100, deletions: 0},
		{label: '.ts', additions: 11, deletions: 5},
	]);
});

test('groupPullRequestFilesByExtension tie-breaks by label', () => {
	const {rows} = groupPullRequestFilesByExtension([
		{filename: 'z.ts', additions: 1, deletions: 1},
		{filename: 'a.md', additions: 1, deletions: 1},
	]);

	assert.deepEqual(rows.map(r => r.label), ['.md', '.ts']);
});
