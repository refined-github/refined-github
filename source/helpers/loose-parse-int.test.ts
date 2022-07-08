import {expect, test} from 'vitest';

import looseParseInt from './loose-parse-int';

test('looseParseInt', () => {
	expect(looseParseInt('1,234')).toBe(1234);
	expect(looseParseInt('Bugs 1,234')).toBe(1234);
	expect(looseParseInt('5000+ issues')).toBe(5000);
});
