import test from 'ava';

import './fixtures/globals';
import pluralize from '../source/helpers/pluralize';
import looseParseInt from '../source/helpers/loose-parse-int';
import getItemsBetween from '../source/helpers/get-items-between';
import {
	getConversationNumber,
	parseTag,
	compareNames,
	getLatestVersionTag,
	shouldFeatureRun,
} from '../source/github-helpers';

test('getConversationNumber', t => {
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
		t.is(result, getConversationNumber());
	}
});

test('parseTag', t => {
	t.deepEqual(parseTag(''), {namespace: '', version: ''});
	t.deepEqual(parseTag('1.2.3'), {namespace: '', version: '1.2.3'});
	t.deepEqual(parseTag('@1.2.3'), {namespace: '', version: '1.2.3'});
	t.deepEqual(parseTag('hi@1.2.3'), {namespace: 'hi', version: '1.2.3'});
	t.deepEqual(parseTag('hi/you@1.2.3'), {namespace: 'hi/you', version: '1.2.3'});
	t.deepEqual(parseTag('@hi/you@1.2.3'), {namespace: '@hi/you', version: '1.2.3'});
});

test('pluralize', t => {
	t.is(pluralize(0, 'A number', '$$ numbers'), '0 numbers');
	t.is(pluralize(0, 'A number', '$$ numbers', 'No numbers'), 'No numbers');
	t.is(pluralize(1, 'A number', '$$ numbers', 'No numbers'), 'A number');
	t.is(pluralize(2, 'A number', '$$ numbers', 'No numbers'), '2 numbers');
	t.is(pluralize(2, 'A number', 'Many numbers', 'No numbers'), 'Many numbers');
});

test('compareNames', t => {
	t.true(compareNames('johndoe', 'John Doe'));
	t.true(compareNames('john-doe', 'John Doe'));
	t.true(compareNames('john-wdoe', 'John W. Doe'));
	t.true(compareNames('john-doe-jr', 'John Doe Jr.'));
	t.true(compareNames('nicolo', 'Nicolò'));
	t.false(compareNames('dotconnor', 'Connor Love'));
	t.false(compareNames('fregante ', 'Federico Brigante'));
});

test('looseParseInt', t => {
	t.is(looseParseInt('1,234'), 1234);
	t.is(looseParseInt('Bugs 1,234'), 1234);
	t.is(looseParseInt('5000+ issues'), 5000);
});

test('getLatestVersionTag', t => {
	t.is(getLatestVersionTag([
		'0.0.0',
		'v1.1',
		'r2.0',
		'3.0',
	]), '3.0', 'Tags should be sorted by version');

	t.is(getLatestVersionTag([
		'v2.1-0',
		'v2.0',
		'r1.5.5',
		'r1.0',
		'v1.0-1',
	]), 'v2.0', 'Prereleases should be ignored');

	t.is(getLatestVersionTag([
		'lol v0.0.0',
		'2.0',
		'2020-10-10',
		'v1.0-1',
	]), 'lol v0.0.0', 'Non-version tags should short-circuit the sorting and return the first tag');
});

test('shouldFeatureRun', t => {
	const yes = (): boolean => true;
	const no = (): boolean => false;
	const yesYes = [yes, yes];
	const yesNo = [yes, no];
	const noNo = [no, no];

	t.true(shouldFeatureRun({}), 'A lack of conditions should mean "run everywhere"');

	t.false(shouldFeatureRun({
		asLongAs: yesNo,
	}), 'Every `asLongAs` should be true to run');

	t.false(shouldFeatureRun({
		asLongAs: yesNo,
		include: [yes],
	}), 'Every `asLongAs` should be true to run, regardless of `include`');

	t.false(shouldFeatureRun({
		include: noNo,
	}), 'At least one `include` should be true to run');

	t.true(shouldFeatureRun({
		include: yesNo,
	}), 'If one `include` is true, then it should run');

	t.false(shouldFeatureRun({
		exclude: yesNo,
	}), 'If any `exclude` is true, then it should not run');

	t.false(shouldFeatureRun({
		include: [yes],
		exclude: yesNo,
	}), 'If any `exclude` is true, then it should not run, regardless of `include`');

	t.false(shouldFeatureRun({
		asLongAs: [yes],
		exclude: yesNo,
	}), 'If any `exclude` is true, then it should not run, regardless of `asLongAs`');

	t.false(shouldFeatureRun({
		asLongAs: [yes],
		include: yesYes,
		exclude: yesNo,
	}), 'If any `exclude` is true, then it should not run, regardless of `asLongAs` and `include`');
});

test('getItemsBetween', t => {
	t.deepEqual(getItemsBetween<number>([1, 10, 100], 10, 100), [10, 100]);
	t.deepEqual(getItemsBetween<number>([1, 10, 100, 1000], 1, 1000), [1, 10, 100, 1000]);
	t.deepEqual(getItemsBetween<number>([1, 10, 100], 100, 1), [1, 10, 100]);
	t.deepEqual(getItemsBetween<number>([1, 10, 100, 1000], 1000, 1), [1, 10, 100, 1000]);
	t.deepEqual(getItemsBetween<number>([1, 10, 100], undefined, 1), [1]);
	t.deepEqual(getItemsBetween<number>([1, 10, 100], undefined, 100), [1, 10, 100]);
});
