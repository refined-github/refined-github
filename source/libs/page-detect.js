/* eslint-disable no-use-before-define, Allows alphabetical order */
/* eslint-disable unicorn/prefer-starts-ends-with, The tested var might not be a string */

import {check as isReserved} from 'github-reserved-names';
import {getUsername} from './utils';

// Drops leading and trailing slash to avoid /\/?/ everywhere
export const getCleanPathname = () => location.pathname.replace(/^[/]|[/]$/g, '');

// Parses a repo's subpage, e.g.
// '/user/repo/issues/' -> 'issues'
// '/user/repo/' -> ''
// returns false if the path is not a repo
export const getRepoPath = () => {
	if (isRepo()) {
		return getCleanPathname().split('/').slice(2).join('/');
	}
	return false;
};

export const getRepoBranch = () => {
	const [,, type, branch] = getCleanPathname().split('/');
	if (isRepo() && type === 'tree') {
		return branch;
	}
	return false;
};

export const getRepoURL = () => location.pathname.slice(1).split('/', 2).join('/');

export const getOwnerAndRepo = () => {
	const [, ownerName, repoName] = location.pathname.split('/', 3);
	return {ownerName, repoName};
};

export const is404 = () => document.title === 'Page not found · GitHub';

export const is500 = () => document.title === 'Server Error · GitHub';

export const isBlame = () => /^blame\//.test(getRepoPath());

export const isCommit = () => isSingleCommit() || isPRCommit();

export const isCommitList = () => /^commits\//.test(getRepoPath());

export const isCompare = () => /^compare/.test(getRepoPath());

export const isDashboard = () => /^$|^(orgs[/][^/]+[/])?dashboard([/]|$)/.test(getCleanPathname());

export const isDiscussion = () => /^orgs\/[^/]+\/teams\/[^/]+($|\/discussions)/.test(getCleanPathname());

export const isEnterprise = () => location.hostname !== 'github.com' && location.hostname !== 'gist.github.com';

export const isGist = () => location.hostname.startsWith('gist.') || location.pathname.startsWith('gist/');

export const isIssue = () => /^issues\/\d+/.test(getRepoPath());

export const isIssueList = () => /^(issues$|pulls$|labels\/)/.test(getRepoPath());

export const isGlobalIssueSearch = () => location.pathname.startsWith('/issues');

export const isLabel = () => /^labels\/\w+/.test(getRepoPath());

export const isLabelList = () => /^labels\/?(((?=\?).*)|$)/.test(getRepoPath());

export const isMilestone = () => /^milestone\/\d+/.test(getRepoPath());

export const isMilestoneList = () => getRepoPath() === 'milestones';

export const isNewIssue = () => /^issues\/new/.test(getRepoPath());

export const isNotifications = () => /^([^/]+[/][^/]+\/)?notifications/.test(getCleanPathname());

export const isProject = () => /^projects\/\d+/.test(getRepoPath());

export const isPR = () => /^pull\/\d+/.test(getRepoPath());

export const isPRConversation = () => /^pull\/\d+$/.test(getRepoPath());

export const isPRCommit = () => /^pull\/\d+\/commits\/[0-9a-f]{5,40}/.test(getRepoPath());

export const isPRFiles = () => /^pull\/\d+\/files/.test(getRepoPath());

export const isGlobalPRSearch = () => location.pathname.startsWith('/pulls');

export const isQuickPR = () => isCompare() && /[?&]quick_pull=1(&|$)/.test(location.search);

export const isReleasesOrTags = () => /^(releases|tags)/.test(getRepoPath());

export const isRepo = () => /^[^/]+\/[^/]+/.test(getCleanPathname()) &&
	!isReserved(getOwnerAndRepo().ownerName) &&
	!isNotifications() &&
	!isDashboard() &&
	!isGist() &&
	!isRepoSearch();

export const isRepoRoot = () => /^(tree[/][^/]+)?$/.test(getRepoPath());

export const isRepoSettings = () => /^settings/.test(getRepoPath());

export const isRepoTree = () => isRepoRoot() || /^tree\//.test(getRepoPath());

export const isSingleCommit = () => /^commit\/[0-9a-f]{5,40}/.test(getRepoPath());

export const isSingleFile = () => /^blob\//.test(getRepoPath());

export const isTrending = () => location.pathname.startsWith('/trending');

export const isUserProfile = () => Boolean(getCleanPathname()) && !isGist() && !isReserved(getCleanPathname()) && !getCleanPathname().includes('/');

export const isOwnUserProfile = () => isUserProfile() && getCleanPathname().startsWith(getUsername());

export const isRepoSearch = () => location.pathname.slice(1).split('/')[2] === 'search';
