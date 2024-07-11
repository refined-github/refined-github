import {test, assert} from 'vitest';

import {shouldFeatureRun} from './feature-utils.js';

test('shouldFeatureRun', async () => {
	const yes = (): boolean => true;
	const no = (): boolean => false;
	const yesYes = [yes, yes];
	const yesNo = [yes, no];
	const noNo = [no, no];

	assert.isTrue(await shouldFeatureRun({}), 'A lack of conditions should mean "run everywhere"');

	assert.isFalse(await shouldFeatureRun({
		asLongAs: yesNo,
	}), 'Every `asLongAs` should be true to run');

	assert.isFalse(await shouldFeatureRun({
		asLongAs: yesNo,
		include: [yes],
	}), 'Every `asLongAs` should be true to run, regardless of `include`');

	assert.isFalse(await shouldFeatureRun({
		include: noNo,
	}), 'At least one `include` should be true to run');

	assert.isTrue(await shouldFeatureRun({
		include: yesNo,
	}), 'If one `include` is true, then it should run');

	assert.isFalse(await shouldFeatureRun({
		exclude: yesNo,
	}), 'If any `exclude` is true, then it should not run');

	assert.isFalse(await shouldFeatureRun({
		include: [yes],
		exclude: yesNo,
	}), 'If any `exclude` is true, then it should not run, regardless of `include`');

	assert.isFalse(await shouldFeatureRun({
		asLongAs: [yes],
		exclude: yesNo,
	}), 'If any `exclude` is true, then it should not run, regardless of `asLongAs`');

	assert.isFalse(await shouldFeatureRun({
		asLongAs: [yes],
		include: yesYes,
		exclude: yesNo,
	}), 'If any `exclude` is true, then it should not run, regardless of `asLongAs` and `include`');
});
