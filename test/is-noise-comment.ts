import test from 'ava';

import isNoiseComment from '../source/helpers/is-noise-comment';

test('isNoiseComment', t => {
	t.true(isNoiseComment('+1'));
	t.true(isNoiseComment('+1!'));
	t.true(isNoiseComment('+10'));
	t.true(isNoiseComment('+9000'));
	t.true(isNoiseComment('-1'));
	t.true(isNoiseComment('👍'));
	t.true(isNoiseComment('👍🏾'));
	t.true(isNoiseComment('me too'));
	t.true(isNoiseComment('ditto'));
	t.true(isNoiseComment('Dito'));
	t.true(isNoiseComment('following'));
	t.true(isNoiseComment('Followig'));
	t.true(isNoiseComment('please update!'));
	t.true(isNoiseComment('please update 🙏🏻'));
	t.true(isNoiseComment('Same here, please update, thanks'));
	t.true(isNoiseComment('Same here! Please update, thank you.'));

	t.false(isNoiseComment('+1\n<some useful information>'));
	t.false(isNoiseComment('Same here. <some useful information>'));
});
