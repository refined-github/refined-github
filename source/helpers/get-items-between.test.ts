import {expect, test} from 'vitest';

import getItemsBetween from './get-items-between';

test('getItemsBetween', () => {
	const list = ['❤️', '💛', '💚', '💙'];

	expect(getItemsBetween(list, '💛', '💚')).toEqual(['💛', '💚']);
	expect(getItemsBetween(list, '💚', '💛')).toEqual(['💛', '💚']);
	expect(getItemsBetween(list, '❤️', '💙')).toEqual(['❤️', '💛', '💚', '💙']);
	expect(getItemsBetween(list, '💙', '❤️')).toEqual(['❤️', '💛', '💚', '💙']);
	expect(getItemsBetween(list, undefined, '❤️')).toEqual(['❤️']);
	expect(getItemsBetween(list, undefined, '💚')).toEqual(['❤️', '💛', '💚']);
	expect(getItemsBetween(list, undefined, '💙')).toEqual(['❤️', '💛', '💚', '💙']);
});
