import {describe, test, assert} from 'vitest';

import isLowQualityComment from './is-low-quality-comment.js';

describe('isLowQualityComment', () => {
	describe('returns true', () => {
		test.each([
			'+1',
			'+1!',
			'+10',
			'+9000',
			'-1',
			'👍',
			'👍🏾',
			'me too',
			'ditto',
			'Dito',
			'following',
			'please update!',
			'please update 🙏🏻',
			'same issue',
			'this same issues',
			'same question',
			'any updates there?',
			'This is still an issue for me',
			'Still an issue',
			'Issue for me too.',
			'and for me',
		])('%s', comment => {
			assert.isTrue(isLowQualityComment(comment));
		});
	});

	describe('returns false', () => {
		test.each([
			'+1\n<some useful information>',
			'Same here. <some useful information>',
			'Same here, please update, thanks',
			'Same here! Please update, thank you.',
		])('%s', comment => {
			assert.isFalse(isLowQualityComment(comment));
		});
	});
});
