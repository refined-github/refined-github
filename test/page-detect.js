import test from 'ava';
import './fixtures/globals';
import * as pageDetect from '../source/libs/page-detect';

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
		t.is(result, pageDetect.getRepoPath(url));
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
		t.deepEqual(ownerAndRepo[url], pageDetect.getOwnerAndRepo());
	});
});

test('is404', t => {
	document.title = 'Page not found · GitHub';
	t.true(pageDetect.is404());

	document.title = 'examples/404: Page not found examples';
	t.false(pageDetect.is404());

	document.title = 'Dashboard';
	t.false(pageDetect.is404());

	document.title = 'Page not found · Issue #266 · sintaxi/surge · GitHub';
	t.false(pageDetect.is404());
});

test('is500', t => {
	document.title = 'Server Error · GitHub';
	t.true(pageDetect.is500());

	document.title = 'examples/500: Server Error examples';
	t.false(pageDetect.is500());

	document.title = 'Dashboard';
	t.false(pageDetect.is500());

	document.title = 'Server Error · Issue #266 · sintaxi/surge · GitHub';
	t.false(pageDetect.is500());
});

test('isBlame', urlMatcherMacro, pageDetect.isBlame, [
	'https://github.com/sindresorhus/refined-github/blame/master/package.json'
], [
	'https://github.com/sindresorhus/refined-github/blob/master/package.json'
]);

test('isCommit', urlMatcherMacro, pageDetect.isCommit, [
	'https://github.com/sindresorhus/refined-github/commit/5b614b9035f2035b839f48b4db7bd5c3298d526f',
	'https://github.com/sindresorhus/refined-github/commit/5b614',
	'https://github.com/sindresorhus/refined-github/pull/148/commits/0019603b83bd97c2f7ef240969f49e6126c5ec85',
	'https://github.com/sindresorhus/refined-github/pull/148/commits/00196'
], [
	'https://github.com/sindresorhus/refined-github/pull/148/commits',
	'https://github.com/sindresorhus/refined-github/branches',
	'https://github.com/sindresorhus/refined-github/pull/148',
	'https://github.com/sindresorhus/refined-github/pull/commits',
	'https://github.com/sindresorhus/refined-github/pulls'
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

test('isCompare', urlMatcherMacro, pageDetect.isCompare, [
	'https://github.com/sindresorhus/refined-github/compare',
	'https://github.com/sindresorhus/refined-github/compare/'
], [
	'https://github.com/sindresorhus/refined-github',
	'https://github.com/sindresorhus/refined-github/graphs'
]);

test('isDashboard', urlMatcherMacro, pageDetect.isDashboard, [
	'https://github.com/',
	'https://github.com',
	'https://github.com/orgs/test/dashboard',
	'https://github.com/dashboard/index/2',
	'https://github.com/dashboard'
], [
	'https://github.com/sindresorhus/refined-github/tree/master/dashboard/index/2',
	'https://github.com/sindresorhus/dashboard',
	'https://github.com/sindresorhus'
]);

test('isDiscussion', urlMatcherMacro, pageDetect.isDiscussion, [
	'https://github.com/orgs/refined-github/teams/core-team/discussions?pinned=1',
	'https://github.com/orgs/refined-github/teams/core-team/discussions/1',
	'https://github.com/orgs/refined-github/teams/core-team'
], [
	'https://github.com/orgs/refined-github/teams/core-team/members',
	'https://github.com/sindresorhus/teams/tree/discussions',
	'https://github.com/sindresorhus/orgs/tree/teams/core-team'
]);

test('isEnterprise', urlMatcherMacro, pageDetect.isEnterprise, [
	'https://github.big-corp.com/',
	'https://not-github.com/',
	'https://my-little-hub.com/'
], [
	'https://github.com/',
	'https://gist.github.com/'
]);

test('isGist', urlMatcherMacro, pageDetect.isGist, [
	'https://gist.github.com',
	'http://gist.github.com',
	'https://gist.github.com/sindresorhus/0ea3c2845718a0a0f0beb579ff14f064'
], [
	'https://github.com',
	'https://help.github.com/'
]);

test('isIssue', urlMatcherMacro, pageDetect.isIssue, [
	'https://github.com/sindresorhus/refined-github/issues/146'
], [
	'http://github.com/sindresorhus/ava',
	'https://github.com',
	'https://github.com/sindresorhus/refined-github/issues'
]);

test('isIssueList', urlMatcherMacro, pageDetect.isIssueList, [
	'http://github.com/sindresorhus/ava/issues',
	'https://github.com/sindresorhus/refined-github/pulls',
	'https://github.com/sindresorhus/refined-github/labels/Priority%3A%20critical',
	'https://github.com/sindresorhus/refined-github/issues?q=is%3Aclosed+sort%3Aupdated-desc'
], [
	'http://github.com/sindresorhus/ava',
	'https://github.com',
	'https://github.com/sindresorhus/refined-github/issues/170',
	'https://github.com/sindresorhus/refined-github/pull/148',
	'http://github.com/sindresorhus/issues',
	'https://github.com/wildlifela/carmichael-lynch-2018/labels'
]);

test('isGlobalIssueSearch', urlMatcherMacro, pageDetect.isGlobalIssueSearch, [
	'https://github.com/issues'
], [
	'https://github.com/sindresorhus/refined-github/issues',
	'https://github.com/sindresorhus/refined-github/issues/170'
]);

test('isMilestone', urlMatcherMacro, pageDetect.isMilestone, [
	'https://github.com/sindresorhus/refined-github/milestone/12'
], [
	'http://github.com/sindresorhus/ava',
	'https://github.com',
	'https://github.com/sindresorhus/refined-github/milestones'
]);

test('isNewIssue', urlMatcherMacro, pageDetect.isNewIssue, [
	'https://github.com/sindresorhus/refined-github/issues/new'
], [
	'http://github.com/sindresorhus/ava',
	'https://github.com',
	'https://github.com/sindresorhus/refined-github/issues'
]);

test('isNotifications', urlMatcherMacro, pageDetect.isNotifications, [
	'https://github.com/notifications',
	'https://github.com/notifications/participating',
	'http://github.com/sindresorhus/refined-github/notifications',
	'https://github.com/sindresorhus/notifications/notifications',
	'https://github.com/notifications?all=1'
], [
	'https://github.com/settings/notifications',
	'https://github.com/watching',
	'https://github.com/sindresorhus/notifications/',
	'https://github.com/jaredhanson/node-notifications/tree/master/lib/notifications'
]);

test('isProject', urlMatcherMacro, pageDetect.isProject, [
	'https://github.com/sindresorhus/refined-github/projects/3'
], [
	'https://github.com/sindresorhus/refined-github/projects/project',
	'https://github.com/sindresorhus/refined-github/project/3',
	'http://github.com/sindresorhus/projects/3',
	'https://github.com/projects/3'
]);

test('isPR', urlMatcherMacro, pageDetect.isPR, [
	'https://github.com/sindresorhus/refined-github/pull/148'
], [
	'http://github.com/sindresorhus/ava',
	'https://github.com',
	'https://github.com/sindresorhus/refined-github/pulls'
]);

test('isPRConversation', urlMatcherMacro, pageDetect.isPRConversation, [
	'https://github.com/sindresorhus/refined-github/pull/148'
], [
	'https://github.com/sindresorhus/refined-github/pull/148/commits',
	'https://github.com/sindresorhus/refined-github/pull/148/files',
	'http://github.com/sindresorhus/ava',
	'https://github.com',
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

test('isPRFiles', urlMatcherMacro, pageDetect.isPRFiles, [
	'https://github.com/sindresorhus/refined-github/pull/148/files'
], [
	'https://github.com/sindresorhus/refined-github/pull/148',
	'https://github.com/sindresorhus/refined-github/pull/commits',
	'https://github.com/sindresorhus/refined-github/pulls'
]);

test('isGlobalPRSearch', urlMatcherMacro, pageDetect.isGlobalPRSearch, [
	'https://github.com/pulls'
], [
	'https://github.com/sindresorhus/refined-github/pulls',
	'https://github.com/sindresorhus/refined-github/pull/148'
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

test('isReleasesOrTags', urlMatcherMacro, pageDetect.isReleasesOrTags, [
	'https://github.com/sindresorhus/refined-github/releases',
	'https://github.com/sindresorhus/refined-github/tags',
	'https://github.com/sindresorhus/refined-github/releases/tag/v1.0.0-beta.4',
	'https://github.com/sindresorhus/refined-github/releases/tag/0.2.1'
], [
	'https://github.com/sindresorhus/refined-github',
	'https://github.com/sindresorhus/refined-github/graphs'
]);

test('isRepo', urlMatcherMacro, pageDetect.isRepo, [
	'http://github.com/sindresorhus/refined-github',
	'https://github.com/sindresorhus/refined-github/issues/146',
	'https://github.com/sindresorhus/notifications/',
	'https://github.com/sindresorhus/refined-github/pull/145'
], [
	'https://github.com/sindresorhus',
	'https://github.com',
	'https://github.com/stars',
	'http://github.com/sindresorhus/refined-github/notifications',
	'https://github.com/sindresorhus/notifications/notifications',
	'https://github.com/orgs/test/dashboard',
	'https://github.com/settings/profile',
	'https://github.com/trending/developers',
	'https://github.com/sindresorhus/refined-github/search?q=diff'
]);

test('isRepoRoot', urlMatcherMacro, pageDetect.isRepoRoot, [
	'https://github.com/sindresorhus/refined-github',
	'https://github.com/sindresorhus/refined-github/',
	'https://github.com/sindresorhus/refined-github/tree/native-copy-buttons',
	'https://github.com/sindresorhus/refined-github/tree/native-copy-buttons/',
	'https://github.com/sindresorhus/refined-github/tree/03fa6b8b4d6e68dea9dc9bee1d197ef5d992fbd6',
	'https://github.com/sindresorhus/refined-github/tree/03fa6b8b4d6e68dea9dc9bee1d197ef5d992fbd6/'
], [
	'https://github.com/',
	'https://github.com/tree/master/issues',
	'https://github.com/sindresorhus/refined-github/issues',
	'https://github.com/sindresorhus/refined-github/tree/master/distribution',
	'https://github.com/sindresorhus/refined-github/tree/master/tree/master'
]);

test('isRepoSettings', urlMatcherMacro, pageDetect.isRepoSettings, [
	'https://github.com/sindresorhus/refined-github/settings',
	'https://github.com/sindresorhus/refined-github/settings/branches'
], [
	'https://github.com/sindresorhus/refined-github/releases'
]);

test('isRepoTree', urlMatcherMacro, pageDetect.isRepoTree, [
	'https://github.com/sindresorhus/refined-github',
	'https://github.com/sindresorhus/refined-github/tree/master/distribution',
	'https://github.com/sindresorhus/refined-github/tree/0.13.0/distribution',
	'https://github.com/sindresorhus/refined-github/tree/57bf435ee12d14b482df0bbd88013a2814c7512e/distribution',
	'https://github.com/sindresorhus/refined-github/tree/57bf4',
	'https://github.com/sindresorhus/refined-github?files=1',
	'https://github.com/sindresorhus/refined-github/tree/master?files=1'
], [
	'https://github.com/sindresorhus/refined-github/issues',
	'https://github.com/sindresorhus/refined-github/issues?files=1',
	'https://github.com/sindresorhus/refined-github/blob/tree/master/distribution'
]);

test('isSingleCommit', urlMatcherMacro, pageDetect.isSingleCommit, [
	'https://github.com/sindresorhus/refined-github/commit/5b614b9035f2035b839f48b4db7bd5c3298d526f',
	'https://github.com/sindresorhus/refined-github/commit/5b614'
], [
	'https://github.com/sindresorhus/refined-github/pull/148/commits',
	'https://github.com/sindresorhus/refined-github/branches'
]);

test('isSingleFile', urlMatcherMacro, pageDetect.isSingleFile, [
	'https://github.com/sindresorhus/refined-github/blob/master/.gitattributes',
	'https://github.com/sindresorhus/refined-github/blob/fix-narrow-diff/distribution/content.css'
], [
	'https://github.com/sindresorhus/refined-github/pull/164/files',
	'https://github.com/sindresorhus/refined-github/commit/57bf4'
]);

test('isTrending', urlMatcherMacro, pageDetect.isTrending, [
	'https://github.com/trending',
	'https://github.com/trending/developers',
	'https://github.com/trending/unknown'
], [
	'https://github.com/settings/trending',
	'https://github.com/watching',
	'https://github.com/jaredhanson/node-trending/tree/master/lib/trending'
]);

test('isUserProfile', urlMatcherMacro, pageDetect.isUserProfile, [
	'https://github.com/sindresorhus'
], [
	'https://github.com/',
	'https://github.com/settings',
	'https://github.com/watching',
	'https://github.com/sindresorhus/refined-github',
	'https://gist.github.com/bfred-it'
]);

test('isRepoSearch', urlMatcherMacro, pageDetect.isRepoSearch, [
	'https://github.com/sindresorhus/refined-github/search?q=diff',
	'https://github.com/sindresorhus/refined-github/search?q=diff&unscoped_q=diff&type=Issues',
	'https://github.com/sindresorhus/refined-github/search'
], [
	'https://github.com/sindresorhus/refined-github',
	'https://github.com/sindresorhus/search'
]);
