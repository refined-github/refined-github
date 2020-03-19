import test from 'ava';
import './fixtures/globals';
import {
	getDiscussionNumber,
	getOwnerAndRepo,
	getRepoPath,
	getReference,
	parseTag,
	compareNames,
	pluralize,
	getScopedSelector,
	looseParseInt
} from '../source/libs/utils';

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
			'https://github.com/sindresorhus/notifications/notifications',
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

test('getRepoPath', t => {
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
			'https://github.com/sindresorhus/notifications/notifications',
			undefined
		],
		[
			'https://github.com/sindresorhus/refined-github',
			''
		],
		[
			'https://github.com/sindresorhus/refined-github/',
			''
		],
		[
			'https://github.com/sindresorhus/refined-github/blame/master/package.json',
			'blame/master/package.json'
		],
		[
			'https://github.com/sindresorhus/refined-github/commit/57bf4',
			'commit/57bf4'
		],
		[
			'https://github.com/sindresorhus/refined-github/compare/test-branch?quick_pull=0',
			'compare/test-branch'
		],
		[
			'https://github.com/sindresorhus/refined-github/tree/master/distribution',
			'tree/master/distribution'
		]
	]);

	for (const [url, result] of pairs) {
		location.href = url;
		t.is(result, getRepoPath());
	}
});

test('getOwnerAndRepo', t => {
	location.href = 'https://github.com/sindresorhus/refined-github/pull/148';
	t.deepEqual(getOwnerAndRepo(), {
		ownerName: 'sindresorhus',
		repoName: 'refined-github'
	});

	location.href = 'https://github.com/DrewML/GifHub/blob/master/.gitignore';
	t.deepEqual(getOwnerAndRepo(), {
		ownerName: 'DrewML',
		repoName: 'GifHub'
	});
});

test('getReference', t => {
	const references: {
		[url: string]: string | undefined;
	} = {
		'https://github.com/sindresorhus/refined-github': undefined,
		'https://github.com/sindresorhus/refined-github/': undefined,

		'https://github.com/sindresorhus/refined-github/tree/master': 'master',
		'https://github.com/sindresorhus/refined-github/tree/62007c8b944808d1b46d42d5e22fa65883d1eaec': '62007c8b944808d1b46d42d5e22fa65883d1eaec',

		'https://github.com/sindresorhus/refined-github/compare': undefined,
		'https://github.com/sindresorhus/refined-github/compare/master': undefined,
		'https://github.com/sindresorhus/refined-github/compare/62007c8b944808d1b46d42d5e22fa65883d1eaec': undefined,
		'https://github.com/sindresorhus/refined-github/compare/master...test': undefined,

		'https://github.com/sindresorhus/refined-github/commits': undefined,
		'https://github.com/sindresorhus/refined-github/commits/master': 'master',
		'https://github.com/sindresorhus/refined-github/commits/62007c8b944808d1b46d42d5e22fa65883d1eaec': '62007c8b944808d1b46d42d5e22fa65883d1eaec',

		'https://github.com/sindresorhus/refined-github/releases/tag/v1.2.3': undefined,

		'https://github.com/sindresorhus/refined-github/blob/master/readme.md': 'master',
		'https://github.com/sindresorhus/refined-github/blob/62007c8b944808d1b46d42d5e22fa65883d1eaec/readme.md': '62007c8b944808d1b46d42d5e22fa65883d1eaec',

		'https://github.com/sindresorhus/refined-github/wiki/topic': undefined,

		'https://github.com/sindresorhus/refined-github/blame/master/readme.md': 'master',
		'https://github.com/sindresorhus/refined-github/blame/62007c8b944808d1b46d42d5e22fa65883d1eaec/readme.md': '62007c8b944808d1b46d42d5e22fa65883d1eaec',

		'https://github.com/sindresorhus/refined-github/pull/123': undefined,
		'https://github.com/sindresorhus/refined-github/pull/2105/commits/': undefined,
		'https://github.com/sindresorhus/refined-github/pull/2105/commits/9df50080dfddee5f7a2a6a1dc4465166339fedfe': undefined
	};

	Object.keys(references).forEach(url => {
		location.href = url;
		t.is(references[url], getReference(), url);
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
