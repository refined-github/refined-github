import looseParseInt from './loose-parse-int.js';

/**
Compute the sum in a `calc()`. Only works with very simple sums of px values.
When used with custom properties, `calc()` are not evaluated when retrieved via `getComputedStyle()`

@example calculateCssCalcString('calc(1px + 2px)') => 3;
*/
export default function calculateCssCalcString(string: string): number {
	const addends = string.split('+').map(part => looseParseInt(part));
	return addends.reduce((a, b) => a + b);
}
