import {expect, test} from 'vitest';

import pluralize from './pluralize';

test('pluralize', () => {
	expect(pluralize(0, 'A number', '$$ numbers')).toBe('0 numbers');
	expect(pluralize(0, 'A number', '$$ numbers', 'No numbers')).toBe('No numbers');
	expect(pluralize(1, 'A number', '$$ numbers', 'No numbers')).toBe('A number');
	expect(pluralize(2, 'A number', '$$ numbers', 'No numbers')).toBe('2 numbers');
	expect(pluralize(2, 'A number', 'Many numbers', 'No numbers')).toBe('Many numbers');
});
