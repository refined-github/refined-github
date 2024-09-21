import {test, expect} from 'vitest';

import {parseConventionalCommit} from './conventional-commits.js';

test('parseConventionalCommit', () => {
	expect(parseConventionalCommit('fix: Commit message')).toMatchInlineSnapshot(`
		{
		  "label": "Fix",
		  "raw": "fix: ",
		  "type": "fix",
		}
	`);
	expect(parseConventionalCommit('feat: Commit message')).toMatchInlineSnapshot(`
		{
		  "label": "Feature",
		  "raw": "feat: ",
		  "type": "feat",
		}
	`);
	expect(parseConventionalCommit('feat(scope): Commit message')).toMatchInlineSnapshot(`
		{
		  "label": "Feature: scope",
		  "raw": "feat(scope): ",
		  "type": "feat",
		}
	`);
	expect(parseConventionalCommit('feat(sco pe): Commit message')).toMatchInlineSnapshot(`
		{
		  "label": "Feature: sco pe",
		  "raw": "feat(sco pe): ",
		  "type": "feat",
		}
	`);
	expect(parseConventionalCommit(('feat: Commit (message)'))).toMatchInlineSnapshot(`
		{
		  "label": "Feature",
		  "raw": "feat: ",
		  "type": "feat",
		}
	`);

	expect(parseConventionalCommit('feat:')).toBeUndefined();
	expect(parseConventionalCommit('Commit message')).toBeUndefined();
	expect(parseConventionalCommit('feat(): Commit message')).toBeUndefined();
	expect(parseConventionalCommit('fe at(scope): Commit message) ')).toBeUndefined();
});
