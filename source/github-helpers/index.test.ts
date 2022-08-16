import {test, assert} from 'vitest';

import {
	getConversationNumber,
	parseTag,
	compareNames,
	getLatestVersionTag,
	shouldFeatureRun,
} from '.';

test('getConversationNumber', () => {
	const pairs = new Map<string, string | undefined>([
		[
			'https://github.com',
			undefined,
		],
		[
			'https://gist.github.com/',
			undefined,
		],
		[
			'https://github.com/settings/developers',
			undefined,
		],
		[
			'https://github.com/refined-github/refined-github',
			undefined,
		],
		[
			'https://github.com/refined-github/refined-github/',
			undefined,
		],
		[
			'https://github.com/refined-github/refined-github/blame/main/package.json',
			undefined,
		],
		[
			'https://github.com/refined-github/refined-github/commit/57bf4',
			undefined,
		],
		[
			'https://github.com/refined-github/refined-github/compare/test-branch?quick_pull=0',
			undefined,
		],
		[
			'https://github.com/refined-github/refined-github/tree/main/distribution',
			undefined,
		],
		[
			'https://github.com/refined-github/refined-github/pull/148/commits/0019603b83bd97c2f7ef240969f49e6126c5ec85',
			'148',
		],
		[
			'https://github.com/refined-github/refined-github/pull/148/commits/00196',
			'148',
		],
		[
			'https://github.com/refined-github/refined-github/pull/148/commits',
			'148',
		],
		[
			'https://github.com/refined-github/refined-github/pull/148',
			'148',
		],
		[
			'https://github.com/refined-github/refined-github/issues/146',
			'146',
		],
		[
			'https://github.com/refined-github/refined-github/issues',
			undefined,
		],
	]);
	for (const [url, result] of pairs) {
		location.href = url;
		assert.equal(result, getConversationNumber());
	}
});

test('parseTag', () => {
	assert.deepEqual(parseTag(''), {namespace: '', version: ''});
	assert.deepEqual(parseTag('1.2.3'), {namespace: '', version: '1.2.3'});
	assert.deepEqual(parseTag('@1.2.3'), {namespace: '', version: '1.2.3'});
	assert.deepEqual(parseTag('hi@1.2.3'), {namespace: 'hi', version: '1.2.3'});
	assert.deepEqual(parseTag('hi/you@1.2.3'), {namespace: 'hi/you', version: '1.2.3'});
	assert.deepEqual(parseTag('@hi/you@1.2.3'), {namespace: '@hi/you', version: '1.2.3'});
});

test('compareNames', () => {
	assert.isTrue(compareNames('johndoe', 'John Doe'));
	assert.isTrue(compareNames('john-doe', 'John Doe'));
	assert.isTrue(compareNames('john-wdoe', 'John W. Doe'));
	assert.isTrue(compareNames('john-doe-jr', 'John Doe Jr.'));
	assert.isTrue(compareNames('nicolo', 'Nicolò'));
	assert.isFalse(compareNames('dotconnor', 'Connor Love'));
	assert.isFalse(compareNames('fregante ', 'Federico Brigante'));
});

test('getLatestVersionTag', () => {
	assert.equal(getLatestVersionTag([
		'0.0.0',
		'v1.1',
		'r2.0',
		'3.0',
	]), '3.0', 'Tags should be sorted by version');

	assert.equal(getLatestVersionTag([
		'v2.1-0',
		'v2.0',
		'r1.5.5',
		'r1.0',
		'v1.0-1',
	]), 'v2.0', 'Prereleases should be ignored');

	assert.equal(getLatestVersionTag([
		'lol v0.0.0',
		'2.0',
		'2020-10-10',
		'v1.0-1',
	]), 'lol v0.0.0', 'Non-version tags should short-circuit the sorting and return the first tag');
});

test('shouldFeatureRun', () => {
	const yes = (): boolean => true;
	const no = (): boolean => false;
	const yesYes = [yes, yes];
	const yesNo = [yes, no];
	const noNo = [no, no];

	assert.isTrue(shouldFeatureRun({}), 'A lack of conditions should mean "run everywhere"');

	assert.isFalse(shouldFeatureRun({
		asLongAs: yesNo,
	}), 'Every `asLongAs` should be true to run');

	assert.isFalse(shouldFeatureRun({
		asLongAs: yesNo,
		include: [yes],
	}), 'Every `asLongAs` should be true to run, regardless of `include`');

	assert.isFalse(shouldFeatureRun({
		include: noNo,
	}), 'At least one `include` should be true to run');

	assert.isTrue(shouldFeatureRun({
		include: yesNo,
	}), 'If one `include` is true, then it should run');

	assert.isFalse(shouldFeatureRun({
		exclude: yesNo,
	}), 'If any `exclude` is true, then it should not run');

	assert.isFalse(shouldFeatureRun({
		include: [yes],
		exclude: yesNo,
	}), 'If any `exclude` is true, then it should not run, regardless of `include`');

	assert.isFalse(shouldFeatureRun({
		asLongAs: [yes],
		exclude: yesNo,
	}), 'If any `exclude` is true, then it should not run, regardless of `asLongAs`');

	assert.isFalse(shouldFeatureRun({
		asLongAs: [yes],
		include: yesYes,
		exclude: yesNo,
	}), 'If any `exclude` is true, then it should not run, regardless of `asLongAs` and `include`');
});
