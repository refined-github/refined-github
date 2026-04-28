import {describe, expect, test} from 'vitest';

import {detectStackParents, type PrInfo} from './detect-stacked-prs.js';

function pr(number: number, baseRefName: string, headRefName: string): PrInfo {
	return {
		number, title: `PR ${number}`, baseRefName, headRefName,
	};
}

describe('detectStackParents', () => {
	test('empty input', () => {
		expect(detectStackParents([])).toEqual(new Map());
	});

	test('single PR has no relations', () => {
		expect(detectStackParents([pr(1, 'main', 'feat-a')])).toEqual(new Map());
	});

	test('unrelated PRs targeting main', () => {
		expect(detectStackParents([
			pr(1, 'main', 'feat-a'),
			pr(2, 'main', 'feat-b'),
		])).toEqual(new Map());
	});

	test('linear stack of 2', () => {
		expect(detectStackParents([
			pr(1, 'main', 'feat-a'),
			pr(2, 'feat-a', 'feat-b'),
		])).toEqual(new Map([[2, 1]]));
	});

	test('linear stack of 4', () => {
		expect(detectStackParents([
			pr(1, 'main', 'feat-a'),
			pr(2, 'feat-a', 'feat-b'),
			pr(3, 'feat-b', 'feat-c'),
			pr(4, 'feat-c', 'feat-d'),
		])).toEqual(new Map([[2, 1], [3, 2], [4, 3]]));
	});

	test('fan-out within threshold (2 children)', () => {
		expect(detectStackParents([
			pr(1, 'main', 'feat-a'),
			pr(2, 'feat-a', 'feat-b'),
			pr(3, 'feat-a', 'feat-c'),
		])).toEqual(new Map([[2, 1], [3, 1]]));
	});

	test('fan-out at threshold (3 children) is still grouped', () => {
		expect(detectStackParents([
			pr(1, 'main', 'feat-a'),
			pr(2, 'feat-a', 'feat-b'),
			pr(3, 'feat-a', 'feat-c'),
			pr(4, 'feat-a', 'feat-d'),
		])).toEqual(new Map([[2, 1], [3, 1], [4, 1]]));
	});

	test('integration branch (>3 children) is excluded', () => {
		expect(detectStackParents([
			pr(1, 'main', 'dev'),
			pr(2, 'dev', 'feat-a'),
			pr(3, 'dev', 'feat-b'),
			pr(4, 'dev', 'feat-c'),
			pr(5, 'dev', 'feat-d'),
		])).toEqual(new Map());
	});

	test('sub-stack inside integration branch is preserved', () => {
		// `dev` (PR 1) has 4 direct children → integration branch, dropped.
		// PR 2 has 1 direct child (PR 6) → relation 6→2 preserved.
		expect(detectStackParents([
			pr(1, 'main', 'dev'),
			pr(2, 'dev', 'feat-a'),
			pr(3, 'dev', 'feat-b'),
			pr(4, 'dev', 'feat-c'),
			pr(5, 'dev', 'feat-d'),
			pr(6, 'feat-a', 'sub-feat'),
		])).toEqual(new Map([[6, 2]]));
	});

	test('configurable threshold', () => {
		// With threshold = 1, a parent with 2 children gets dropped.
		expect(detectStackParents([
			pr(1, 'main', 'feat-a'),
			pr(2, 'feat-a', 'feat-b'),
			pr(3, 'feat-a', 'feat-c'),
		], 1)).toEqual(new Map());
	});

	test('PR with same head and base is ignored', () => {
		expect(detectStackParents([pr(1, 'feat-a', 'feat-a')])).toEqual(new Map());
	});

	test('parent missing from list means orphan child has no relation', () => {
		// PR 2 thinks its base is feat-a, but PR 1 (head: feat-a) is not in the list.
		expect(detectStackParents([pr(2, 'feat-a', 'feat-b')])).toEqual(new Map());
	});
});
