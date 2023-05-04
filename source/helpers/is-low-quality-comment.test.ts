import {test, assert} from 'vitest';

import isLowQualityComment from './is-low-quality-comment.js';

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

	assert.isFalse(isLowQualityComment('+1\n<some useful information>'));
	assert.isFalse(isLowQualityComment('Same here. <some useful information>'));
	assert.isFalse(isLowQualityComment('Same here, please update, thanks'));
	assert.isFalse(isLowQualityComment('Same here! Please update, thank you.'));
});
