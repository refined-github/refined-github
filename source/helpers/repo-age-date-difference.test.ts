import {readFileSync} from 'node:fs';

import {assert, test} from 'vitest';

import hasSignificantDateDifference from './repo-age-date-difference.js';

const now = new Date('2026-01-01T00:00:00Z');

test('requires a difference strictly greater than ten percent', () => {
	assert.isFalse(hasSignificantDateDifference(new Date(1100), new Date(1000), new Date(2000)));
	assert.isTrue(hasSignificantDateDifference(new Date(1101), new Date(1000), new Date(2000)));
	assert.isFalse(hasSignificantDateDifference(new Date(1000), new Date(1000), new Date(1000)));
});

test('requests the repository creation date', () => {
	const query = readFileSync('source/features/repo-age-first-commit.gql', 'utf8');
	assert.include(query, 'createdAt');
});

test('ignores small differences between repository and first-commit dates', () => {
	assert.isFalse(hasSignificantDateDifference(
		new Date('2025-02-01T00:00:00Z'),
		new Date('2025-01-01T00:00:00Z'),
		now,
	));
});

test('flags substantial differences between repository and first-commit dates', () => {
	assert.isTrue(hasSignificantDateDifference(
		new Date('2025-03-01T00:00:00Z'),
		new Date('2025-01-01T00:00:00Z'),
		now,
	));

	assert.isTrue(hasSignificantDateDifference(
		new Date('2013-10-25T15:19:00Z'),
		new Date('2022-01-21T15:47:24Z'),
		now,
	));
});
