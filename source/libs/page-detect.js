/* eslint-disable unicorn/prefer-starts-ends-with */
/* The tested var might not be a string */

import {check as isReserved} from 'github-reserved-names';
import {getUsername, getCleanPathname, getRepoPath, getOwnerAndRepo} from './utils';

export const is404 = () => document.title === 'Page not found · GitHub';

export const is500 = () => document.title === 'Server Error · GitHub';

export const isBlame = () => /^blame\//.test(getRepoPath());

export const isCommit = () => isSingleCommit() || isPRCommit();

export const isCommitList = () => /^commits\//.test(getRepoPath());

export const isCompare = () => /^compare/.test(getRepoPath());

export const isDashboard = () => /^$|^(orgs[/][^/]+[/])?dashboard([/]|$)/.test(getCleanPathname());

// TODO: change name to clarify what discussion this is
export const isDiscussion = () => /^orgs\/[^/]+\/teams\/[^/]+($|\/discussions)/.test(getCleanPathname());

export const isEnterprise = () => location.hostname !== 'github.com' && location.hostname !== 'gist.github.com';

export const isGist = () => location.hostname.startsWith('gist.') || location.pathname.startsWith('gist/');

export const isGlobalIssueSearch = () => location.pathname === '/issues';

export const isGlobalPRSearch = () => location.pathname === '/pulls';

export const isGlobalSearchResults = () => location.pathname === '/search' && new URLSearchParams(location.search).get('q') !== null;

export const isIssue = () => /^issues\/\d+/.test(getRepoPath());

export const isIssueList = () => /^(issues$|pulls$|labels\/)/.test(getRepoPath());

export const isLabel = () => /^labels\/\w+/.test(getRepoPath());

export const isLabelList = () => /^labels\/?(((?=\?).*)|$)/.test(getRepoPath());

export const isMilestone = () => /^milestone\/\d+/.test(getRepoPath());

export const isMilestoneList = () => getRepoPath() === 'milestones';

export const isNewIssue = () => /^issues\/new/.test(getRepoPath());

export const isNotifications = () => /^([^/]+[/][^/]+\/)?notifications/.test(getCleanPathname());

export const isOwnUserProfile = () => isUserProfile() && getCleanPathname() === getUsername();

export const isProject = () => /^projects\/\d+/.test(getRepoPath());

export const isPR = () => /^pull\/\d+/.test(getRepoPath());

export const isPRList = () => getRepoPath() === 'pulls';

export const isPRCommit = () => /^pull\/\d+\/commits\/[0-9a-f]{5,40}/.test(getRepoPath());

export const isPRConversation = () => /^pull\/\d+$/.test(getRepoPath());

export const isPRFiles = () => /^pull\/\d+\/files/.test(getRepoPath());

export const isQuickPR = () => isCompare() && /[?&]quick_pull=1(&|$)/.test(location.search);

export const isReleasesOrTags = () => /^(releases|tags)/.test(getRepoPath());

export const isRepo = () => /^[^/]+\/[^/]+/.test(getCleanPathname()) &&
	!isReserved(getOwnerAndRepo().ownerName) &&
	!isNotifications() &&
	!isDashboard() &&
	!isGist() &&
	!isRepoSearch();

export const isRepoRoot = () => /^(tree[/][^/]+)?$/.test(getRepoPath());

export const isRepoSearch = () => location.pathname.slice(1).split('/')[2] === 'search';

export const isRepoSettings = () => /^settings/.test(getRepoPath());

export const isRepoTree = () => isRepoRoot() || /^tree\//.test(getRepoPath());

export const isSingleCommit = () => /^commit\/[0-9a-f]{5,40}/.test(getRepoPath());

export const isSingleFile = () => /^blob\//.test(getRepoPath());

export const isTrending = () => location.pathname === '/trending' || location.pathname.startsWith('/trending/');

export const isUserProfile = () => {
	const path = getCleanPathname();
	return Boolean(path) && !isGist() && !isReserved(path) && !path.includes('/');
};
