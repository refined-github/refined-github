import test from 'ava';

import isLowQualityComment from '../source/helpers/is-low-quality-comment.js';

test('isLowQualityComment', t => {
	t.true(isLowQualityComment('+1'));
	t.true(isLowQualityComment('+1!'));
	t.true(isLowQualityComment('+10'));
	t.true(isLowQualityComment('+9000'));
	t.true(isLowQualityComment('-1'));
	t.true(isLowQualityComment('👍'));
	t.true(isLowQualityComment('👍🏾'));
	t.true(isLowQualityComment('me too'));
	t.true(isLowQualityComment('ditto'));
	t.true(isLowQualityComment('Dito'));
	t.true(isLowQualityComment('following'));
	t.true(isLowQualityComment('Followig'));
	t.true(isLowQualityComment('please update!'));
	t.true(isLowQualityComment('please update 🙏🏻'));
	t.true(isLowQualityComment('Same here, please update, thanks'));
	t.true(isLowQualityComment('Same here! Please update, thank you.'));

	t.false(isLowQualityComment('+1\n<some useful information>'));
	t.false(isLowQualityComment('Same here. <some useful information>'));
});
