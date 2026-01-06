import {test, expect} from 'vitest';

import {parseConventionalCommit} from './conventional-commits.js';

test('parseConventionalCommit', () => {
	expect(parseConventionalCommit('fix: Commit message')).toMatchInlineSnapshot(`
		{
		  "raw": "fix: ",
		  "rawType": "fix",
		  "scope": undefined,
		  "type": "Fix",
		}
	`);
	expect(parseConventionalCommit('feat: Commit message')).toMatchInlineSnapshot(`
		{
		  "raw": "feat: ",
		  "rawType": "feat",
		  "scope": undefined,
		  "type": "Feature",
		}
	`);
	expect(parseConventionalCommit('fix!: Breaking change')).toMatchInlineSnapshot(`
		{
		  "raw": "fix!: ",
		  "rawType": "fix",
		  "scope": undefined,
		  "type": "Fix!",
		}
	`);
	expect(parseConventionalCommit('feat(scope): Commit message')).toMatchInlineSnapshot(`
		{
		  "raw": "feat(scope): ",
		  "rawType": "feat",
		  "scope": "scope: ",
		  "type": "Feature",
		}
	`);
	expect(parseConventionalCommit('feat(scope)!: Breaking change')).toMatchInlineSnapshot(`
		{
		  "raw": "feat(scope)!: ",
		  "rawType": "feat",
		  "scope": "scope: ",
		  "type": "Feature!",
		}
	`);
	expect(parseConventionalCommit('revert(scope): Revert "feat(scope): Commit message"')).toMatchInlineSnapshot(`
		{
		  "raw": "revert(scope): ",
		  "rawType": "revert",
		  "scope": "scope: ",
		  "type": "Revert",
		}
	`);
	expect(parseConventionalCommit('feat(sco pe): Commit message')).toMatchInlineSnapshot(`
		{
		  "raw": "feat(sco pe): ",
		  "rawType": "feat",
		  "scope": "sco pe: ",
		  "type": "Feature",
		}
	`);
	expect(parseConventionalCommit(('feat: Commit (message)'))).toMatchInlineSnapshot(`
		{
		  "raw": "feat: ",
		  "rawType": "feat",
		  "scope": undefined,
		  "type": "Feature",
		}
	`);
	expect(parseConventionalCommit('fix:')).toMatchInlineSnapshot(`
		{
		  "raw": "fix:",
		  "rawType": "fix",
		  "scope": undefined,
		  "type": "Fix",
		}
	`);

	expect(parseConventionalCommit('idk(label): not recognized')).toBeUndefined();
	expect(parseConventionalCommit('Commit message')).toBeUndefined();
	expect(parseConventionalCommit('feat(): Commit message')).toBeUndefined();
	expect(parseConventionalCommit('fe at(scope): Commit message) ')).toBeUndefined();
});

test('parseConventionalCommit support upper case types', () => {
	expect(parseConventionalCommit('Fix: Commit message')).toMatchInlineSnapshot(`
		{
		  "raw": "Fix: ",
		  "rawType": "Fix",
		  "scope": undefined,
		  "type": "Fix",
		}
	`);
	expect(parseConventionalCommit('Feat: Commit message')).toMatchInlineSnapshot(`
		{
		  "raw": "Feat: ",
		  "rawType": "Feat",
		  "scope": undefined,
		  "type": "Feature",
		}
	`);
	expect(parseConventionalCommit('Fix!: Breaking change')).toMatchInlineSnapshot(`
		{
		  "raw": "Fix!: ",
		  "rawType": "Fix",
		  "scope": undefined,
		  "type": "Fix!",
		}
	`);
	expect(parseConventionalCommit('Feat(scope): Commit message')).toMatchInlineSnapshot(`
		{
		  "raw": "Feat(scope): ",
		  "rawType": "Feat",
		  "scope": "scope: ",
		  "type": "Feature",
		}
	`);
	expect(parseConventionalCommit('Feat(scope)!: Breaking change')).toMatchInlineSnapshot(`
		{
		  "raw": "Feat(scope)!: ",
		  "rawType": "Feat",
		  "scope": "scope: ",
		  "type": "Feature!",
		}
	`);
	expect(parseConventionalCommit('Revert(scope): Revert "Feat(scope): Commit message"')).toMatchInlineSnapshot(`
		{
		  "raw": "Revert(scope): ",
		  "rawType": "Revert",
		  "scope": "scope: ",
		  "type": "Revert",
		}
	`);
	expect(parseConventionalCommit('Feat(sco pe): Commit message')).toMatchInlineSnapshot(`
		{
		  "raw": "Feat(sco pe): ",
		  "rawType": "Feat",
		  "scope": "sco pe: ",
		  "type": "Feature",
		}
	`);
	expect(parseConventionalCommit(('Feat: Commit (message)'))).toMatchInlineSnapshot(`
		{
		  "raw": "Feat: ",
		  "rawType": "Feat",
		  "scope": undefined,
		  "type": "Feature",
		}
	`);
	expect(parseConventionalCommit('Fix:')).toMatchInlineSnapshot(`
		{
		  "raw": "Fix:",
		  "rawType": "Fix",
		  "scope": undefined,
		  "type": "Fix",
		}
	`);

	expect(parseConventionalCommit('Idk(label): not recognized')).toBeUndefined();
	expect(parseConventionalCommit('Commit message')).toBeUndefined();
	expect(parseConventionalCommit('Feat(): Commit message')).toBeUndefined();
	expect(parseConventionalCommit('Fe at(scope): Commit message) ')).toBeUndefined();
});
