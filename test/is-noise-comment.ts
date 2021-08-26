import test from 'ava';

import isUselessComment from '../source/helpers/is-useless-comment';

test('isUselessComment', t => {
	t.true(isUselessComment('+1'));
	t.true(isUselessComment('+1!'));
	t.true(isUselessComment('+10'));
	t.true(isUselessComment('+9000'));
	t.true(isUselessComment('-1'));
	t.true(isUselessComment('👍'));
	t.true(isUselessComment('👍🏾'));
	t.true(isUselessComment('me too'));
	t.true(isUselessComment('ditto'));
	t.true(isUselessComment('Dito'));
	t.true(isUselessComment('following'));
	t.true(isUselessComment('Followig'));
	t.true(isUselessComment('please update!'));
	t.true(isUselessComment('please update 🙏🏻'));
	t.true(isUselessComment('Same here, please update, thanks'));
	t.true(isUselessComment('Same here! Please update, thank you.'));

	t.false(isUselessComment('+1\n<some useful information>'));
	t.false(isUselessComment('Same here. <some useful information>'));
});
