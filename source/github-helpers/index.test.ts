import {expect, test} from 'vitest';

import {
	getConversationNumber,
	parseTag,
	compareNames,
	getLatestVersionTag,
	shouldFeatureRun,
	addHotkey,
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
		expect(result).toBe(getConversationNumber());
	}
});

test('parseTag', () => {
	expect(parseTag('')).toEqual({namespace: '', version: ''});
	expect(parseTag('1.2.3')).toEqual({namespace: '', version: '1.2.3'});
	expect(parseTag('@1.2.3')).toEqual({namespace: '', version: '1.2.3'});
	expect(parseTag('hi@1.2.3')).toEqual({namespace: 'hi', version: '1.2.3'});
	expect(parseTag('hi/you@1.2.3')).toEqual({namespace: 'hi/you', version: '1.2.3'});
	expect(parseTag('@hi/you@1.2.3')).toEqual({namespace: '@hi/you', version: '1.2.3'});
});

test('compareNames', () => {
	expect(compareNames('johndoe', 'John Doe')).toBe(true);
	expect(compareNames('john-doe', 'John Doe')).toBe(true);
	expect(compareNames('john-wdoe', 'John W. Doe')).toBe(true);
	expect(compareNames('john-doe-jr', 'John Doe Jr.')).toBe(true);
	expect(compareNames('nicolo', 'Nicolò')).toBe(true);
	expect(compareNames('dotconnor', 'Connor Love')).toBe(false);
	expect(compareNames('fregante ', 'Federico Brigante')).toBe(false);
});

test('getLatestVersionTag', () => {
	expect(getLatestVersionTag([
		'0.0.0',
		'v1.1',
		'r2.0',
		'3.0',
	])).toBe('3.0');

	expect(getLatestVersionTag([
		'v2.1-0',
		'v2.0',
		'r1.5.5',
		'r1.0',
		'v1.0-1',
	])).toBe('v2.0');

	expect(getLatestVersionTag([
		'lol v0.0.0',
		'2.0',
		'2020-10-10',
		'v1.0-1',
	])).toBe('lol v0.0.0');
});

test('shouldFeatureRun', () => {
	const yes = (): boolean => true;
	const no = (): boolean => false;
	const yesYes = [yes, yes];
	const yesNo = [yes, no];
	const noNo = [no, no];

	expect(shouldFeatureRun({})).toBe(true);

	expect(shouldFeatureRun({
		asLongAs: yesNo,
	})).toBe(false);

	expect(shouldFeatureRun({
		asLongAs: yesNo,
		include: [yes],
	})).toBe(false);

	expect(shouldFeatureRun({
		include: noNo,
	})).toBe(false);

	expect(shouldFeatureRun({
		include: yesNo,
	})).toBe(true);

	expect(shouldFeatureRun({
		exclude: yesNo,
	})).toBe(false);

	expect(shouldFeatureRun({
		include: [yes],
		exclude: yesNo,
	})).toBe(false);

	expect(shouldFeatureRun({
		asLongAs: [yes],
		exclude: yesNo,
	})).toBe(false);

	expect(shouldFeatureRun({
		asLongAs: [yes],
		include: yesYes,
		exclude: yesNo,
	})).toBe(false);
});

const testAddHotkey = (existing: string | undefined, added: string, final: string): void => {
	const link = document.createElement('a');
	if (existing) {
		link.setAttribute('data-hotkey', existing);
	}

	addHotkey(link, added);
	expect(link.dataset.hotkey).toBe(final);
};

test('addHotkey if one is specified', testAddHotkey.bind(null,
	'T-REX',
	'CHICKEN',
	'T-REX,CHICKEN',
));
test('addHotkey if the same is already specified', testAddHotkey.bind(null,
	'CHICKEN',
	'CHICKEN',
	'CHICKEN',
));
test('addHotkey when none are specified', testAddHotkey.bind(null,
	undefined,
	'CHICKEN',
	'CHICKEN',
));
