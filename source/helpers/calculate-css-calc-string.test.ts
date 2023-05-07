import {test, assert} from 'vitest';

import calculateCssCalcString from './calculate-css-calc-string.js';

test('calculateCssCalcString', () => {
	assert.equal(calculateCssCalcString('calc(1px)'), 1);
	assert.equal(calculateCssCalcString('calc(1px + 10px)'), 11);
	assert.equal(calculateCssCalcString('calc(1px + 10px + 234px)'), 245);
	assert.equal(calculateCssCalcString('calc(1% / 1em)'), 11); // Yup 🤫, only px is allowed
});
