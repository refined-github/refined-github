import {test, assert} from 'vitest';

import getItemsBetween from './get-items-between.js';

test('getItemsBetween', () => {
	const list = ['❤️', '💛', '💚', '💙'];

	assert.deepEqual(getItemsBetween(list, '💛', '💚'), ['💛', '💚']);
	assert.deepEqual(getItemsBetween(list, '💚', '💛'), ['💛', '💚']);
	assert.deepEqual(getItemsBetween(list, '❤️', '💙'), ['❤️', '💛', '💚', '💙']);
	assert.deepEqual(getItemsBetween(list, '💙', '❤️'), ['❤️', '💛', '💚', '💙']);
	assert.deepEqual(getItemsBetween(list, undefined, '❤️'), ['❤️']);
	assert.deepEqual(getItemsBetween(list, undefined, '💚'), ['❤️', '💛', '💚']);
	assert.deepEqual(getItemsBetween(list, undefined, '💙'), ['❤️', '💛', '💚', '💙']);
});
