import {readFileSync} from 'node:fs';

import {expect, test} from 'vitest';

test('renders the locked indicator with GitHub’s medium StateLabel classes', () => {
	const source = readFileSync('source/features/locked-issue.tsx', 'utf8');

	expect(source).toContain("'prc-StateLabel prc-StateLabel--medium");
});
