import {expect, test} from 'vitest';

import isLowQualityComment from './is-low-quality-comment';

test('isLowQualityComment', () => {
	expect(isLowQualityComment('+1')).toBe(true);
	expect(isLowQualityComment('+1!')).toBe(true);
	expect(isLowQualityComment('+10')).toBe(true);
	expect(isLowQualityComment('+9000')).toBe(true);
	expect(isLowQualityComment('-1')).toBe(true);
	expect(isLowQualityComment('👍')).toBe(true);
	expect(isLowQualityComment('👍🏾')).toBe(true);
	expect(isLowQualityComment('me too')).toBe(true);
	expect(isLowQualityComment('ditto')).toBe(true);
	expect(isLowQualityComment('Dito')).toBe(true);
	expect(isLowQualityComment('following')).toBe(true);
	expect(isLowQualityComment('please update!')).toBe(true);
	expect(isLowQualityComment('please update 🙏🏻')).toBe(true);
	expect(isLowQualityComment('same issue')).toBe(true);
	expect(isLowQualityComment('this same issues')).toBe(true);
	expect(isLowQualityComment('same question')).toBe(true);
	expect(isLowQualityComment('any updates there?')).toBe(true);

	expect(isLowQualityComment('+1\n<some useful information>')).toBe(false);
	expect(isLowQualityComment('Same here. <some useful information>')).toBe(false);
	expect(isLowQualityComment('Same here, please update, thanks')).toBe(false);
	expect(isLowQualityComment('Same here! Please update, thank you.')).toBe(false);
});
