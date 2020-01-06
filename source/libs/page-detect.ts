/* eslint-disable unicorn/prefer-starts-ends-with, @typescript-eslint/prefer-string-starts-ends-with */
/* The tested var might not be a string */

import select from 'select-dom';
import reservedNames from 'github-reserved-names/reserved-names.json';
import {getUsername, getCleanPathname, getRepoPath, getOwnerAndRepo} from './utils';

const skip = 'skip'; // To be used only to skip tests of combined functions, i.e. isPageA() || isPageB()
const domBased = 'skip'; // To be used only to skip tests that are DOM-based rather than URL-based

export const is404 = (): boolean => document.title === 'Page not found · GitHub';
export const _is404 = domBased; // They're specified in page-detect.ts

export const is500 = (): boolean => document.title === 'Server Error · GitHub' || document.title === 'Unicorn! · GitHub';
export const _is500 = domBased; // They're specified in page-detect.ts

export const isBlame = (): boolean => /^blame\//.test(getRepoPath()!);
export const _isBlame = [
	'https://github.com/sindresorhus/refined-github/blame/master/package.json'
];

export const isCommit = (): boolean => isSingleCommit() || isPRCommit();
export const _isCommit = [
	'https://github.com/sindresorhus/refined-github/commit/5b614b9035f2035b839f48b4db7bd5c3298d526f',
	'https://github.com/sindresorhus/refined-github/commit/5b614',
	'https://github.com/sindresorhus/refined-github/pull/148/commits/0019603b83bd97c2f7ef240969f49e6126c5ec85',
	'https://github.com/sindresorhus/refined-github/pull/148/commits/00196'
];

export const isCommitList = (): boolean => isRepoCommitList() || isPRCommitList();
export const _isCommitList = [
	'https://github.com/sindresorhus/refined-github/commits/master?page=2',
	'https://github.com/sindresorhus/refined-github/commits/test-branch',
	'https://github.com/sindresorhus/refined-github/commits/0.13.0',
	'https://github.com/sindresorhus/refined-github/commits/230c2',
	'https://github.com/sindresorhus/refined-github/commits/230c2935fc5aea9a681174ddbeba6255ca040d63',
	'https://github.com/sindresorhus/refined-github/pull/148/commits'
];

export const isRepoCommitList = (): boolean => /^commits\//.test(getRepoPath()!);
export const _isRepoCommitList = [
	'https://github.com/sindresorhus/refined-github/commits/master?page=2',
	'https://github.com/sindresorhus/refined-github/commits/test-branch',
	'https://github.com/sindresorhus/refined-github/commits/0.13.0',
	'https://github.com/sindresorhus/refined-github/commits/230c2',
	'https://github.com/sindresorhus/refined-github/commits/230c2935fc5aea9a681174ddbeba6255ca040d63'
];

export const isCompare = (): boolean => /^compare/.test(getRepoPath()!);
export const _isCompare = [
	'https://github.com/sindresorhus/refined-github/compare',
	'https://github.com/sindresorhus/refined-github/compare/',
	'https://github.com/sindresorhus/refined-github/compare/master...branch-name',
	'https://github.com/sindresorhus/refined-github/compare/master...branch-name?quick_pull=1',
	'https://github.com/sindresorhus/refined-github/compare/branch-1...branch-2?quick_pull=1',
	'https://github.com/sindresorhus/refined-github/compare/test-branch?quick_pull=1'
];

export const isDashboard = (): boolean => !isGist() && /^$|^(orgs[/][^/]+[/])?dashboard([/]|$)/.test(getCleanPathname());
export const _isDashboard = [
	'https://github.com/',
	'https://github.com',
	'https://github.com/orgs/test/dashboard',
	'https://github.com/dashboard/index/2',
	'https://github.com/dashboard',
	'https://github.com/orgs/edit/dashboard',
	'https://github.big-corp.com/',
	'https://not-github.com/',
	'https://my-little-hub.com/'
];

export const isEnterprise = (): boolean => location.hostname !== 'github.com' && location.hostname !== 'gist.github.com';
export const _isEnterprise = [
	'https://github.big-corp.com/',
	'https://not-github.com/',
	'https://my-little-hub.com/',
	'https://my-little-hub.com/gist'
];

export const isGist = (): boolean => location.hostname.startsWith('gist.') || location.pathname.split('/', 2)[1] === 'gist';
export const _isGist = [
	'https://gist.github.com',
	'http://gist.github.com',
	'https://gist.github.com/sindresorhus/0ea3c2845718a0a0f0beb579ff14f064',
	'https://my-little-hub.com/gist'
];

export const isGlobalDiscussionList = (): boolean => ['issues', 'pulls'].includes(location.pathname.split('/', 2)[1]);
export const _isGlobalDiscussionList = [
	'https://github.com/issues',
	'https://github.com/issues?q=is%3Apr+is%3Aopen',
	'https://github.com/issues/assigned',
	'https://github.com/issues/mentioned',
	'https://github.com/pulls',
	'https://github.com/pulls?q=issues',
	'https://github.com/pulls/assigned',
	'https://github.com/pulls/mentioned',
	'https://github.com/pulls/review-requested'
];

export const isGlobalSearchResults = (): boolean => location.pathname === '/search' && new URLSearchParams(location.search).get('q') !== null;
export const _isGlobalSearchResults = [
	'https://github.com/search?q=refined-github&ref=opensearch'
];

export const isIssue = (): boolean => /^issues\/\d+/.test(getRepoPath()!);
export const _isIssue = [
	'https://github.com/sindresorhus/refined-github/issues/146'
];

export const isDiscussionList = (): boolean => isGlobalDiscussionList() || isRepoDiscussionList();
export const _isDiscussionList = skip;

export const isLabelList = (): boolean => getRepoPath() === 'labels';
export const _isLabelList = [
	'https://github.com/sindresorhus/refined-github/labels'
];

export const isMilestone = (): boolean => /^milestone\/\d+/.test(getRepoPath()!);
export const _isMilestone = [
	'https://github.com/sindresorhus/refined-github/milestone/12'
];

export const isMilestoneList = (): boolean => getRepoPath() === 'milestones';
export const _isMilestoneList = [
	'https://github.com/sindresorhus/refined-github/milestones'
];

export const isNewIssue = (): boolean => /^issues\/new/.test(getRepoPath()!);
export const _isNewIssue = [
	'https://github.com/sindresorhus/refined-github/issues/new'
];

export const isNewRelease = (): boolean => /^releases\/new/.test(getRepoPath()!);
export const _isNewRelease = [
	'https://github.com/sindresorhus/refined-github/releases/new'
];

export const isNotifications = (): boolean => /^([^/]+[/][^/]+\/)?notifications/.test(getCleanPathname());
export const _isNotifications = [
	'https://github.com/notifications',
	'https://github.com/notifications/participating',
	'https://github.com/sindresorhus/notifications/notifications',
	'https://github.com/notifications?all=1'
];

export const isOrganizationProfile = (): boolean => select.exists('.orghead');
export const _isOrganizationProfile = domBased;

export const isOrganizationDiscussion = (): boolean => /^orgs\/[^/]+\/teams\/[^/]+($|\/discussions)/.test(getCleanPathname());
export const _isOrganizationDiscussion = [
	'https://github.com/orgs/refined-github/teams/core-team/discussions?pinned=1',
	'https://github.com/orgs/refined-github/teams/core-team/discussions/1',
	'https://github.com/orgs/refined-github/teams/core-team'
];

export const isOwnUserProfile = (): boolean => getCleanPathname() === getUsername();
export const _isOwnUserProfile = domBased;

// If there's a Report Abuse link, we're not part of the org
export const isOwnOrganizationProfile = (): boolean => isOrganizationProfile() && !select.exists('[href*="contact/report-abuse?report="]');
export const _isOwnOrganizationProfile = domBased;

export const isProject = (): boolean => /^projects\/\d+/.test(getRepoPath()!);
export const _isProject = [
	'https://github.com/sindresorhus/refined-github/projects/3'
];

export const isPR = (): boolean => /^pull\/\d+/.test(getRepoPath()!);
export const _isPR = [
	'https://github.com/sindresorhus/refined-github/pull/148',
	'https://github.com/sindresorhus/refined-github/pull/148/commits',
	'https://github.com/sindresorhus/refined-github/pull/148/files',
	'https://github.com/sindresorhus/refined-github/pull/148/conflicts',
	'https://github.com/sindresorhus/refined-github/pull/148/commits/00196',
	'https://github.com/sindresorhus/refined-github/pull/148/commits/0019603b83bd97c2f7ef240969f49e6126c5ec85'
];

export const isConflict = (): boolean => /^pull\/\d+\/conflicts/.test(getRepoPath()!);
export const _isConflict = [
	'https://github.com/sindresorhus/refined-github/pull/148/conflicts'
];

/**
 * Do not use this detection if you're looking for PRs, they may appear mixed with issues in search. Use `isDiscussionList`
 */
export const isPRList = (): boolean => location.pathname === '/pulls' || getRepoPath() === 'pulls';
export const _isPRList = [
	'https://github.com/pulls',
	'https://github.com/pulls?q=issues',
	'https://github.com/sindresorhus/refined-github/pulls',
	'https://github.com/sindresorhus/refined-github/pulls/',
	'https://github.com/sindresorhus/refined-github/pulls?q=is%3Aopen+is%3Apr',
	'https://github.com/sindresorhus/refined-github/pulls?q=is%3Apr+is%3Aclosed'
];

export const isPRCommit = (): boolean => /^pull\/\d+\/commits\/[0-9a-f]{5,40}/.test(getRepoPath()!);
export const _isPRCommit = [
	'https://github.com/sindresorhus/refined-github/pull/148/commits/0019603b83bd97c2f7ef240969f49e6126c5ec85',
	'https://github.com/sindresorhus/refined-github/pull/148/commits/00196'
];

export const isPRConversation = (): boolean => /^pull\/\d+$/.test(getRepoPath()!);
export const _isPRConversation = [
	'https://github.com/sindresorhus/refined-github/pull/148'
];

export const isPRCommitList = (): boolean => /^pull\/\d+\/commits$/.test(getRepoPath()!);
export const _isPRCommitList = [
	'https://github.com/sindresorhus/refined-github/pull/148/commits'
];

export const isPRFiles = (): boolean => /^pull\/\d+\/files/.test(getRepoPath()!);
export const _isPRFiles = [
	'https://github.com/sindresorhus/refined-github/pull/148/files'
];

export const isQuickPR = (): boolean => isCompare() && /[?&]quick_pull=1(&|$)/.test(location.search);
export const _isQuickPR = [
	'https://github.com/sindresorhus/refined-github/compare/master...branch-name?quick_pull=1',
	'https://github.com/sindresorhus/refined-github/compare/branch-1...branch-2?quick_pull=1',
	'https://github.com/sindresorhus/refined-github/compare/test-branch?quick_pull=1'
];

export const isReleasesOrTags = (): boolean => {
	const parts = (getRepoPath() ?? '').split('/');
	return /^(releases|tags)$/.test(parts[0]) && parts[1] !== 'new';
};

export const _isReleasesOrTags = [
	'https://github.com/sindresorhus/refined-github/releases',
	'https://github.com/sindresorhus/refined-github/tags',
	'https://github.com/sindresorhus/refined-github/releases/tag/v1.0.0-beta.4',
	'https://github.com/sindresorhus/refined-github/releases/tag/0.2.1'
];

export const isEditingFile = (): boolean => /^edit/.test(getRepoPath()!);
export const _isEditingFile = [
	'https://github.com/sindresorhus/refined-github/edit/master/readme.md',
	'https://github.com/sindresorhus/refined-github/edit/ghe-injection/source/background.ts'
];

export const isRepo = (): boolean => /^[^/]+\/[^/]+/.test(getCleanPathname()) &&
	!reservedNames.includes(getOwnerAndRepo().ownerName!) &&
	!isNotifications() &&
	!isDashboard() &&
	!isGist() &&
	!isRepoSearch();
export const _isRepo = [
	'https://github.com/sindresorhus/refined-github/blame/master/package.json',
	'https://github.com/sindresorhus/refined-github/issues/146',
	'https://github.com/sindresorhus/notifications/',
	'https://github.com/sindresorhus/refined-github/pull/148'
];
export const _isRepoSkipNegatives = true;

export const isRepoDiscussionList = (): boolean =>
	isRepoPRList() ||
	isRepoIssueList() ||
	/^labels\/.+/.test(getRepoPath()!);
export const _isRepoDiscussionList = [
	'http://github.com/sindresorhus/ava/issues',
	'https://github.com/sindresorhus/refined-github/pulls',
	'https://github.com/sindresorhus/refined-github/pulls/',
	'https://github.com/sindresorhus/refined-github/pulls/fregante',
	'https://github.com/sindresorhus/refined-github/issues/fregante',
	'https://github.com/sindresorhus/refined-github/labels/Priority%3A%20critical',
	'https://github.com/sindresorhus/refined-github/issues?q=is%3Aclosed+sort%3Aupdated-desc',
	'https://github.com/sindresorhus/refined-github/pulls?q=is%3Aopen+is%3Apr',
	'https://github.com/sindresorhus/refined-github/pulls?q=is%3Apr+is%3Aclosed',
	'https://github.com/sindresorhus/refined-github/issues'
];

export const isRepoPRList = (): boolean => (getRepoPath() ?? '').startsWith('pulls');
export const _isRepoPRList = [
	'https://github.com/sindresorhus/refined-github/pulls',
	'https://github.com/sindresorhus/refined-github/pulls/',
	'https://github.com/sindresorhus/refined-github/pulls/fregante',
	'https://github.com/sindresorhus/refined-github/pulls?q=is%3Aopen+is%3Apr',
	'https://github.com/sindresorhus/refined-github/pulls?q=is%3Apr+is%3Aclosed'
];

export const isRepoIssueList = (): boolean => {
	const parts = (getRepoPath() ?? '').split('/');
	return parts[0] === 'issues' && parts[1] !== 'new' && !/\d/.test(parts[1]); // `issues/fregante` is a list but `issues/1` isn't
};

export const _isRepoIssueList = [
	'http://github.com/sindresorhus/ava/issues',
	'https://github.com/sindresorhus/refined-github/issues',
	'https://github.com/sindresorhus/refined-github/issues/fregante',
	'https://github.com/sindresorhus/refined-github/issues?q=is%3Aclosed+sort%3Aupdated-desc'
];

export const isRepoRoot = (): boolean => /^(tree[/][^/]+)?$/.test(getRepoPath()!);
export const _isRepoRoot = [
	// Some tests are here only as "gotchas" for other tests that may misidentify their pages
	'https://github.com/sindresorhus/edit',
	'https://github.com/sindresorhus/search',
	'https://github.com/sindresorhus/refined-github',
	'https://github.com/sindresorhus/refined-github/',
	'https://github.com/sindresorhus/notifications/',
	'https://github.com/sindresorhus/refined-github/tree/native-copy-buttons',
	'https://github.com/sindresorhus/refined-github/tree/native-copy-buttons/',
	'https://github.com/sindresorhus/refined-github/tree/03fa6b8b4d6e68dea9dc9bee1d197ef5d992fbd6',
	'https://github.com/sindresorhus/refined-github/tree/03fa6b8b4d6e68dea9dc9bee1d197ef5d992fbd6/',
	'https://github.com/sindresorhus/refined-github/tree/57bf4',
	'https://github.com/sindresorhus/refined-github?files=1',
	'https://github.com/sindresorhus/refined-github/tree/master?files=1'
];

export const isRepoSearch = (): boolean => location.pathname.slice(1).split('/')[2] === 'search';
export const _isRepoSearch = [
	'https://github.com/sindresorhus/refined-github/search?q=diff',
	'https://github.com/sindresorhus/refined-github/search?q=diff&unscoped_q=diff&type=Issues',
	'https://github.com/sindresorhus/refined-github/search'
];

export const isRepoSettings = (): boolean => /^settings/.test(getRepoPath()!);
export const _isRepoSettings = [
	'https://github.com/sindresorhus/refined-github/settings',
	'https://github.com/sindresorhus/refined-github/settings/branches'
];

export const isRepoTree = (): boolean => isRepoRoot() || /^tree\//.test(getRepoPath()!);
export const _isRepoTree = [
	'https://github.com/sindresorhus/refined-github/tree/master/distribution',
	'https://github.com/sindresorhus/refined-github/tree/0.13.0/distribution',
	'https://github.com/sindresorhus/refined-github/tree/57bf435ee12d14b482df0bbd88013a2814c7512e/distribution'
].concat(_isRepoRoot);

export const isRepoWithAccess = (): boolean => isRepo() && select.exists('.reponav-item[href$="/settings"]');
export const _isRepoWithAccess = domBased;

export const isSingleCommit = (): boolean => /^commit\/[0-9a-f]{5,40}/.test(getRepoPath()!);
export const _isSingleCommit = [
	'https://github.com/sindresorhus/refined-github/commit/5b614b9035f2035b839f48b4db7bd5c3298d526f',
	'https://github.com/sindresorhus/refined-github/commit/5b614'
];

export const isSingleFile = (): boolean => /^blob\//.test(getRepoPath()!);
export const _isSingleFile = [
	'https://github.com/sindresorhus/refined-github/blob/master/.gitattributes',
	'https://github.com/sindresorhus/refined-github/blob/fix-narrow-diff/distribution/content.css',
	'https://github.com/sindresorhus/refined-github/blob/master/edit.txt'
];
export const isSingleGist = (): boolean => isGist() && /^\/(gist\/)?[^/]+\/[0-9a-f]{32}$/.test(location.pathname);
export const _isSingleGist = [
	'https://gist.github.com/sindresorhus/0ea3c2845718a0a0f0beb579ff14f064'
];

export const isTrending = (): boolean => location.pathname === '/trending' || location.pathname.startsWith('/trending/');
export const _isTrending = [
	'https://github.com/trending',
	'https://github.com/trending/developers',
	'https://github.com/trending/unknown'
];

export const isUserProfile = (): boolean => select.exists('.user-profile-nav');
export const _isUserProfile = domBased;

export const isSingleTagPage = (): boolean => /^(releases\/tag)/.test(getRepoPath()!);
export const _isSingleTagPage = [
	'https://github.com/sindresorhus/refined-github/releases/tag/v1.0.0-beta.4',
	'https://github.com/sindresorhus/refined-github/releases/tag/0.2.1'
];

export const _hasComments = skip;
export const hasComments = (): boolean =>
	isPR() ||
	isIssue() ||
	isCommit() ||
	isOrganizationDiscussion();

export const _hasRichTextEditor = skip;
export const hasRichTextEditor = (): boolean =>
	hasComments() ||
	isNewIssue() ||
	isCompare();

export const _hasCode = skip;
export const hasCode = (): boolean => // Static code, not the editor
	hasComments() ||
	isRepoTree() || // Readme files
	isSingleFile() ||
	isGist() ||
	isCompare() ||
	isBlame();
