import test from 'ava';

import './fixtures/globals';
import pluralize from '../source/helpers/pluralize';
import {
	getDiscussionNumber,
	getCurrentRepository,
	parseTag,
	compareNames,
	getScopedSelector,
	looseParseInt,
	getLatestVersionTag,
	preventPrCommitLinkLoss,
	prCommitUrlRegex
} from '../source/github-helpers';

test('getDiscussionNumber', t => {
	const pairs = new Map<string, string | undefined>([
		[
			'https://github.com',
			undefined
		],
		[
			'https://gist.github.com/',
			undefined
		],
		[
			'https://github.com/settings/developers',
			undefined
		],
		[
			'https://github.com/sindresorhus/refined-github',
			undefined
		],
		[
			'https://github.com/sindresorhus/refined-github/',
			undefined
		],
		[
			'https://github.com/sindresorhus/refined-github/blame/master/package.json',
			undefined
		],
		[
			'https://github.com/sindresorhus/refined-github/commit/57bf4',
			undefined
		],
		[
			'https://github.com/sindresorhus/refined-github/compare/test-branch?quick_pull=0',
			undefined
		],
		[
			'https://github.com/sindresorhus/refined-github/tree/master/distribution',
			undefined
		],
		[
			'https://github.com/sindresorhus/refined-github/pull/148/commits/0019603b83bd97c2f7ef240969f49e6126c5ec85',
			'148'
		],
		[
			'https://github.com/sindresorhus/refined-github/pull/148/commits/00196',
			'148'
		],
		[
			'https://github.com/sindresorhus/refined-github/pull/148/commits',
			'148'
		],
		[
			'https://github.com/sindresorhus/refined-github/pull/148',
			'148'
		],
		[
			'https://github.com/sindresorhus/refined-github/issues/146',
			'146'
		],
		[
			'https://github.com/sindresorhus/refined-github/issues',
			undefined
		]
	]);
	for (const [url, result] of pairs) {
		location.href = url;
		t.is(result, getDiscussionNumber());
	}
});

test('getOwnerAndRepo', t => {
	location.href = 'https://github.com/sindresorhus/refined-github/pull/148';
	t.deepEqual(getCurrentRepository(), {
		owner: 'sindresorhus',
		name: 'refined-github'
	});
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

test('getScopedSelector', t => {
	const pairs = new Map<string, string>([
		[
			'[href$="settings"]',
			':scope > [href$="settings"]'
		],
		[
			'.reponav-dropdown,[href$="settings"]',
			':scope > .reponav-dropdown,:scope > [href$="settings"]'
		],
		[
			'.reponav-dropdown, [href$="settings"]',
			':scope > .reponav-dropdown,:scope > [href$="settings"]'
		]
	]);

	for (const [selector, result] of pairs) {
		t.is(result, getScopedSelector(selector));
	}
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
		'3.0'
	]), '3.0', 'Tags should be sorted by version');

	t.is(getLatestVersionTag([
		'v2.1-0',
		'v2.0',
		'r1.5.5',
		'r1.0',
		'v1.0-1'
	]), 'v2.0', 'Prereleases should be ignored');

	t.is(getLatestVersionTag([
		'lol v0.0.0',
		'2.0',
		'2020-10-10',
		'v1.0-1'
	]), 'lol v0.0.0', 'Non-version tags should short-circuit the sorting and return the first tag');
});

function replace(string: string): string {
	return string.replace(prCommitUrlRegex, preventPrCommitLinkLoss);
}

test('preventPrCommitLinkLoss', t => {
	t.is(replace('https://www.google.com/'), 'https://www.google.com/');
	t.is(
		replace('https://github.com/sindresorhus/refined-github/commit/cb44a4eb8cd5c66def3dc26dca0f386645fa29bb'),
		'https://github.com/sindresorhus/refined-github/commit/cb44a4eb8cd5c66def3dc26dca0f386645fa29bb',
		'It should not affect non PR commit URLs'
	);
	t.is(
		replace('https://github.com/sindresorhus/refined-github/pull/3/commits/cb44a4eb8cd5c66def3dc26dca0f386645fa29bb'),
		'[`cb44a4e` (#3)](https://github.com/sindresorhus/refined-github/pull/3/commits/cb44a4eb8cd5c66def3dc26dca0f386645fa29bb)'
	);
	t.is(
		replace('lorem ipsum dolor https://github.com/sindresorhus/refined-github/pull/3/commits/cb44a4eb8cd5c66def3dc26dca0f386645fa29bb some random string'),
		'lorem ipsum dolor [`cb44a4e` (#3)](https://github.com/sindresorhus/refined-github/pull/3/commits/cb44a4eb8cd5c66def3dc26dca0f386645fa29bb) some random string'
	);
	t.is(
		replace(replace('lorem ipsum dolor https://github.com/sindresorhus/refined-github/pull/44/commits/cb44a4eb8cd5c66def3dc26dca0f386645fa29bb some random string')),
		'lorem ipsum dolor [`cb44a4e` (#44)](https://github.com/sindresorhus/refined-github/pull/44/commits/cb44a4eb8cd5c66def3dc26dca0f386645fa29bb) some random string',
		'It should not apply it twice'
	);
	t.is(
		replace('I like [turtles](https://github.com/sindresorhus/refined-github/pull/3/commits/cb44a4eb8cd5c66def3dc26dca0f386645fa29bb)'),
		'I like [turtles](https://github.com/sindresorhus/refined-github/pull/3/commits/cb44a4eb8cd5c66def3dc26dca0f386645fa29bb)',
		'It should ignore Markdown links'
	);
	t.is(
		replace('lorem ipsum dolor https://github.com/sindresorhus/refined-github/pull/3205/commits/1da152b3f8c51dd72d8ae6ad9cc96e0c2d8716f5#diff-932095cc3c0dff00495b4c392d78f0afR60 some random string'),
		'lorem ipsum dolor [`1da152b` (#3205)](https://github.com/sindresorhus/refined-github/pull/3205/commits/1da152b3f8c51dd72d8ae6ad9cc96e0c2d8716f5#diff-932095cc3c0dff00495b4c392d78f0afR60) some random string',
		'It should include any hashes'
	);
	t.is(
		replace(replace('lorem ipsum dolor https://github.com/sindresorhus/refined-github/pull/3205/commits/1da152b3f8c51dd72d8ae6ad9cc96e0c2d8716f5#diff-932095cc3c0dff00495b4c392d78f0afR60 some random string')),
		'lorem ipsum dolor [`1da152b` (#3205)](https://github.com/sindresorhus/refined-github/pull/3205/commits/1da152b3f8c51dd72d8ae6ad9cc96e0c2d8716f5#diff-932095cc3c0dff00495b4c392d78f0afR60) some random string',
		'It should not apply it twice even with hashes'
	);
});
