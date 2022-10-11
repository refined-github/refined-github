import {test, assert, describe} from 'vitest';

import isLowQualityComment from './is-low-quality-comment';

describe('isLowQualityComment', () => {
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
		'any news?',
		'+++ !!!\nThanks !!!',
		'+1\nThx for your job!',
		'+1 and thank you for your work',
		'Same here, please update, thanks',
		'Same here! Please update, thank you.',
	])('%s', text => assert.isTrue(isLowQualityComment(text)));

	test.each([
		'+1\n<some useful information>',
		'Same here. <some useful information>',
		'Same here on v1.2',
		'Thanks!',
		'Thank you 👍',
	])('%s', text => assert.isFalse(isLowQualityComment(text)));
});
