import test from 'ava';

import getItemsBetween from './get-items-between';

test('getItemsBetween', t => {
	const list = ['❤️', '💛', '💚', '💙'];

	t.deepEqual(getItemsBetween(list, '💛', '💚'), ['💛', '💚']);
	t.deepEqual(getItemsBetween(list, '💚', '💛'), ['💛', '💚']);
	t.deepEqual(getItemsBetween(list, '❤️', '💙'), ['❤️', '💛', '💚', '💙']);
	t.deepEqual(getItemsBetween(list, '💙', '❤️'), ['❤️', '💛', '💚', '💙']);
	t.deepEqual(getItemsBetween(list, undefined, '❤️'), ['❤️']);
	t.deepEqual(getItemsBetween(list, undefined, '💚'), ['❤️', '💛', '💚']);
	t.deepEqual(getItemsBetween(list, undefined, '💙'), ['❤️', '💛', '💚', '💙']);
});
