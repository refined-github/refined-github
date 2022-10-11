import {test, assert} from 'vitest';

import isLowQualityComment from './is-low-quality-comment';

test('isLowQualityComment', () => {
	assert.isTrue(isLowQualityComment('+1'));
	assert.isTrue(isLowQualityComment('+1!'));
	assert.isTrue(isLowQualityComment('+10'));
	assert.isTrue(isLowQualityComment('+9000'));
	assert.isTrue(isLowQualityComment('-1'));
	assert.isTrue(isLowQualityComment('👍'));
	assert.isTrue(isLowQualityComment('👍🏾'));
	assert.isTrue(isLowQualityComment('me too'));
	assert.isTrue(isLowQualityComment('ditto'));
	assert.isTrue(isLowQualityComment('Dito'));
	assert.isTrue(isLowQualityComment('following'));
	assert.isTrue(isLowQualityComment('please update!'));
	assert.isTrue(isLowQualityComment('please update 🙏🏻'));
	assert.isTrue(isLowQualityComment('same issue'));
	assert.isTrue(isLowQualityComment('this same issues'));
	assert.isTrue(isLowQualityComment('same question'));
	assert.isTrue(isLowQualityComment('any updates there?'));
	assert.isTrue(isLowQualityComment('any news?'));
	assert.isTrue(isLowQualityComment('+++ !!!\nThanks !!!'));
	assert.isTrue(isLowQualityComment('+1\nThx for your job!'));
	assert.isTrue(isLowQualityComment('+1 and thank you for your work'));
	assert.isTrue(isLowQualityComment('Same here, please update, thanks'));
	assert.isTrue(isLowQualityComment('Same here! Please update, thank you.'));

	assert.isFalse(isLowQualityComment('+1\n<some useful information>'));
	assert.isFalse(isLowQualityComment('Same here. <some useful information>'));
	assert.isFalse(isLowQualityComment('Same here on v1.2'));
	assert.isFalse(isLowQualityComment('Thanks!'));
	assert.isFalse(isLowQualityComment('Thank you 👍'));
});
