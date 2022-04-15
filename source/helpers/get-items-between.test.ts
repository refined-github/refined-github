import test from 'ava';

import getItemsBetween from './get-items-between';

test('getItemsBetween', t => {
	const list = ['❤️', '💛', '💚', '💙'];

	t.deepEqual(getItemsBetween<string>(list, '💛', '💚'), ['💛', '💚']);
	t.deepEqual(getItemsBetween<string>(list, '💚', '💛'), ['💛', '💚']);
	t.deepEqual(getItemsBetween<string>(list, '❤️', '💙'), ['❤️', '💛', '💚', '💙']);
	t.deepEqual(getItemsBetween<string>(list, '💙', '❤️'), ['❤️', '💛', '💚', '💙']);
	t.deepEqual(getItemsBetween<string>(list, undefined, '❤️'), ['❤️']);
	t.deepEqual(getItemsBetween<string>(list, undefined, '💚'), ['❤️', '💛', '💚']);
	t.deepEqual(getItemsBetween<string>(list, undefined, '💙'), ['❤️', '💛', '💚', '💙']);
});
