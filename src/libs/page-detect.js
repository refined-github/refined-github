/* eslint-disable no-use-before-define */
/* eslint-disable unicorn/prefer-starts-ends-with */
// - xo complains if you don't use .startsWith
// but getRepoPath returns undefined if it doesn't find a repo
// so .test(X) works but X.startsWith() doesn't

import {check as isReserved} from 'github-reserved-names';

// Drops leading and trailing slash to avoid /\/?/ everywhere
export const getCleanPathname = () => location.pathname.replace(/^[/]|[/]$/g, '');

// Parses a repo's subpage, e.g.
// '/user/repo/issues/' -> 'issues'
// '/user/repo/' -> ''
// and returns undefined if the path is not 2+ levels deep
export const getRepoPath = () => (/^[^/]+[/][^/]+[/]?(.*)$/.exec(getCleanPathname()) || [])[1];

export const getRepoURL = () => location.pathname.slice(1).split('/', 2).join('/');

export const getOwnerAndRepo = () => {
	const [, ownerName, repoName] = location.pathname.split('/');
	return {ownerName, repoName};
};

export const is404 = () => document.title.startsWith('Page not found');

export const isBlame = () => /^blame\//.test(getRepoPath());

export const isCommit = () => isSingleCommit() || isPRCommit();

export const isCommitList = () => /^commits\//.test(getRepoPath());

export const isCompare = () => /^compare/.test(getRepoPath());

export const isDashboard = () => /^((orgs[/][^/]+[/])?dashboard([/]index[/]\d+)?)?$/.test(getCleanPathname());

export const isEnterprise = () => location.hostname !== 'github.com' && location.hostname !== 'gist.github.com';

export const isGist = () => location.hostname.startsWith('gist.') || location.pathname.startsWith('gist/');

export const isIssue = () => /^issues\/\d+/.test(getRepoPath());

export const isIssueList = () => /^issues\/?$/.test(getRepoPath());

export const isIssueSearch = () => location.pathname.startsWith('/issues');

export const isLabel = () => /^labels\/\w+/.test(getRepoPath());

export const isLabelList = () => /^labels\/?(((?=\?).*)|$)/.test(getRepoPath());

export const isMilestone = () => /^milestone\/\d+/.test(getRepoPath());

export const isMilestoneList = () => /^milestones\/?$/.test(getRepoPath());

export const isNotifications = () => /^([^/]+[/][^/]+\/)?notifications/.test(getCleanPathname());

export const isPR = () => /^pull\/\d+/.test(getRepoPath());

export const isPRCommit = () => /^pull\/\d+\/commits\/[0-9a-f]{5,40}/.test(getRepoPath());

export const isPRFiles = () => /^pull\/\d+\/files/.test(getRepoPath());

export const isPRList = () => /^pulls\/?$/.test(getRepoPath());

export const isPRSearch = () => location.pathname.startsWith('/pulls');

export const isQuickPR = () => isCompare() && /[?&]quick_pull=1(&|$)/.test(location.search);

export const isReleases = () => /^(releases|tags)/.test(getRepoPath());

export const isRepo = () => /^[^/]+\/[^/]+/.test(getCleanPathname()) &&
	!isReserved(getOwnerAndRepo().ownerName) &&
	!isNotifications() &&
	!isDashboard() &&
	!isGist();

export const isRepoRoot = () => /^(tree[/][^/]+)?$/.test(getRepoPath());

export const isRepoSettings = () => /^settings/.test(getRepoPath());

export const isRepoTree = () => /^tree\//.test(getRepoPath());

export const isSingleCommit = () => /^commit\/[0-9a-f]{5,40}/.test(getRepoPath());

export const isSingleFile = () => /^blob\//.test(getRepoPath());

export const isTrending = () => location.pathname.startsWith('/trending');
