import test from 'ava';
import * as pageDetect from '../src/libs/page-detect';
import Window from './fixtures/window';

global.window = new Window();
global.location = window.location;

function urlMatcherMacro(t, detectFn, shouldMatch = [], shouldNotMatch = []) {
	for (const url of shouldMatch) {
		location.href = url;
		t.true(detectFn(url));
	}

	for (const url of shouldNotMatch) {
		location.href = url;
		t.false(detectFn(url));
	}
}

test('isGist', urlMatcherMacro, pageDetect.isGist, [
	'https://gist.github.com',
	'http://gist.github.com',
	'https://gist.github.com/sindresorhus/0ea3c2845718a0a0f0beb579ff14f064'
], [
	'https://github.com',
	'https://help.github.com/'
]);

test('isDashboard', urlMatcherMacro, pageDetect.isDashboard, [
	'https://github.com/',
	'https://github.com',
	'https://github.com/orgs/test/dashboard',
	'https://github.com/dashboard'
], [
	'https://github.com/sindresorhus'
]);

test('isRepo', urlMatcherMacro, pageDetect.isRepo, [
	'http://github.com/sindresorhus/refined-github',
	'https://github.com/sindresorhus/refined-github/issues/146',
	'https://github.com/sindresorhus/refined-github/pull/145'
], [
	'https://github.com/sindresorhus',
	'https://github.com',
	'https://github.com/stars'
]);

test('isRepoTree', urlMatcherMacro, pageDetect.isRepoTree, [
	'https://github.com/sindresorhus/refined-github/tree/master/extension',
	'https://github.com/sindresorhus/refined-github/tree/0.13.0/extension',
	'https://github.com/sindresorhus/refined-github/tree/57bf435ee12d14b482df0bbd88013a2814c7512e/extension',
	'https://github.com/sindresorhus/refined-github/tree/57bf4'
], [
	'https://github.com/sindresorhus/refined-github/issues',
	'https://github.com/sindresorhus/refined-github'
]);

test('isIssueSearch', urlMatcherMacro, pageDetect.isIssueSearch, [
	'https://github.com/issues'
], [
	'https://github.com/sindresorhus/refined-github/issues',
	'https://github.com/sindresorhus/refined-github/issues/170'
]);

test('isIssueList', urlMatcherMacro, pageDetect.isIssueList, [
	'http://github.com/sindresorhus/ava/issues'
], [
	'http://github.com/sindresorhus/ava',
	'https://github.com',
	'https://github.com/sindresorhus/refined-github/issues/170'
]);

test('isIssue', urlMatcherMacro, pageDetect.isIssue, [
	'https://github.com/sindresorhus/refined-github/issues/146'
], [
	'http://github.com/sindresorhus/ava',
	'https://github.com',
	'https://github.com/sindresorhus/refined-github/issues'
]);

test('isPRSearch', urlMatcherMacro, pageDetect.isPRSearch, [
	'https://github.com/pulls'
], [
	'https://github.com/sindresorhus/refined-github/pulls',
	'https://github.com/sindresorhus/refined-github/pull/148'
]);

test('isPRList', urlMatcherMacro, pageDetect.isPRList, [
	'https://github.com/sindresorhus/refined-github/pulls'
], [
	'http://github.com/sindresorhus/ava',
	'https://github.com',
	'https://github.com/sindresorhus/refined-github/pull/148'
]);

test('isPR', urlMatcherMacro, pageDetect.isPR, [
	'https://github.com/sindresorhus/refined-github/pull/148'
], [
	'http://github.com/sindresorhus/ava',
	'https://github.com',
	'https://github.com/sindresorhus/refined-github/pulls'
]);

test('isPRFiles', urlMatcherMacro, pageDetect.isPRFiles, [
	'https://github.com/sindresorhus/refined-github/pull/148/files'
], [
	'https://github.com/sindresorhus/refined-github/pull/148',
	'https://github.com/sindresorhus/refined-github/pull/commits',
	'https://github.com/sindresorhus/refined-github/pulls'
]);

test('isPRCommit', urlMatcherMacro, pageDetect.isPRCommit, [
	'https://github.com/sindresorhus/refined-github/pull/148/commits/0019603b83bd97c2f7ef240969f49e6126c5ec85',
	'https://github.com/sindresorhus/refined-github/pull/148/commits/00196'
], [
	'https://github.com/sindresorhus/refined-github/pull/148',
	'https://github.com/sindresorhus/refined-github/pull/commits',
	'https://github.com/sindresorhus/refined-github/pulls'
]);

test('isMilestone', urlMatcherMacro, pageDetect.isMilestone, [
	'https://github.com/sindresorhus/refined-github/milestone/12'
], [
	'http://github.com/sindresorhus/ava',
	'https://github.com',
	'https://github.com/sindresorhus/refined-github/milestones'
]);

test('isCommitList', urlMatcherMacro, pageDetect.isCommitList, [
	'https://github.com/sindresorhus/refined-github/commits/master?page=2',
	'https://github.com/sindresorhus/refined-github/commits/test-branch',
	'https://github.com/sindresorhus/refined-github/commits/0.13.0',
	'https://github.com/sindresorhus/refined-github/commits/230c2',
	'https://github.com/sindresorhus/refined-github/commits/230c2935fc5aea9a681174ddbeba6255ca040d63'
], [
	'https://github.com/sindresorhus/refined-github/pull/148',
	'https://github.com/sindresorhus/refined-github/pull/commits',
	'https://github.com/sindresorhus/refined-github/branches'
]);

test('isSingleCommit', urlMatcherMacro, pageDetect.isSingleCommit, [
	'https://github.com/sindresorhus/refined-github/commit/5b614b9035f2035b839f48b4db7bd5c3298d526f',
	'https://github.com/sindresorhus/refined-github/commit/5b614'
], [
	'https://github.com/sindresorhus/refined-github/pull/148/commits',
	'https://github.com/sindresorhus/refined-github/branches'
]);

test('isReleases', urlMatcherMacro, pageDetect.isReleases, [
	'https://github.com/sindresorhus/refined-github/releases'
], [
	'https://github.com/sindresorhus/refined-github',
	'https://github.com/sindresorhus/refined-github/graphs'
]);

test('isBlame', urlMatcherMacro, pageDetect.isBlame, [
	'https://github.com/sindresorhus/refined-github/blame/master/package.json'
], [
	'https://github.com/sindresorhus/refined-github/blob/master/package.json'
]);

test('isNotifications', urlMatcherMacro, pageDetect.isNotifications, [
	'https://github.com/notifications',
	'https://github.com/notifications/participating',
	'https://github.com/notifications?all=1'
], [
	'https://github.com/settings/notifications',
	'https://github.com/watching',
	'https://github.com/jaredhanson/node-notifications/tree/master/lib/notifications'
]);

test('isSingleFile', urlMatcherMacro, pageDetect.isSingleFile, [
	'https://github.com/sindresorhus/refined-github/blob/master/.gitattributes',
	'https://github.com/sindresorhus/refined-github/blob/fix-narrow-diff/extension/content.css'
], [
	'https://github.com/sindresorhus/refined-github/pull/164/files',
	'https://github.com/sindresorhus/refined-github/commit/57bf4'
]);

test('isRepoSettings', urlMatcherMacro, pageDetect.isRepoSettings, [
	'https://github.com/sindresorhus/refined-github/settings',
	'https://github.com/sindresorhus/refined-github/settings/branches'
], [
	'https://github.com/sindresorhus/refined-github/releases'
]);

test('isCompare', urlMatcherMacro, pageDetect.isCompare, [
	'https://github.com/sindresorhus/refined-github/compare',
	'https://github.com/sindresorhus/refined-github/compare/'
], [
	'https://github.com/sindresorhus/refined-github',
	'https://github.com/sindresorhus/refined-github/graphs'
]);

test('isQuickPR', urlMatcherMacro, pageDetect.isQuickPR, [
	'https://github.com/sindresorhus/refined-github/compare/master...branch-name?quick_pull=1',
	'https://github.com/sindresorhus/refined-github/compare/branch-1...branch-2?quick_pull=1',
	'https://github.com/sindresorhus/refined-github/compare/test-branch?quick_pull=1'
], [
	'https://github.com/sindresorhus/refined-github',
	'https://github.com/sindresorhus/refined-github/compare',
	'https://github.com/sindresorhus/refined-github/compare/',
	'https://github.com/sindresorhus/refined-github/compare/test-branch',
	'https://github.com/sindresorhus/refined-github/compare/branch-1...branch-2',
	'https://github.com/sindresorhus/refined-github/compare/branch-1...branch-2?expand=1'
]);

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
		t.deepEqual(ownerAndRepo[url], pageDetect.getOwnerAndRepo());
	});
});
