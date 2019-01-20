import test from 'ava';
import './fixtures/globals';
import * as utils from '../source/libs/utils';

test('getRepoPath', t => {
	const pairs = new Map([
		[
			'https://github.com',
			false
		],
		[
			'https://gist.github.com/',
			false
		],
		[
			'https://github.com/settings/developers',
			false
		],
		[
			'https://github.com/sindresorhus/notifications/notifications',
			false
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
		t.is(result, utils.getRepoPath(url));
	}
});

test('getOwnerAndRepo', t => {
	const ownerAndRepo = {
		'https://github.com/sindresorhus/refined-github/pull/148': {
			ownerName: 'sindresorhus',
			repoName: 'refined-github'
		},
		'https://github.com/DrewML/GifHub/blob/master/.gitignore': {
			ownerName: 'DrewML',
			repoName: 'GifHub'
		}
	};

	Object.keys(ownerAndRepo).forEach(url => {
		location.href = url;
		t.deepEqual(ownerAndRepo[url], utils.getOwnerAndRepo());
	});
});
