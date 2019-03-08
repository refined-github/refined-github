/* eslint-disable unicorn/prefer-starts-ends-with */
/* The tested var might not be a string */

import select from 'select-dom';
import {check as isReserved} from 'github-reserved-names';
import {getUsername, getCleanPathname, getRepoPath, getOwnerAndRepo} from './utils';

export const is404 = (): boolean => document.title === 'GitHub · Where software is built';

export const is500 = (): boolean => document.title === 'Server Error · GitHub';

export const isBlame = (): boolean => /^blame\//.test(getRepoPath() as string);

export const isCommit = (): boolean => isSingleCommit() || isPRCommit();

export const isCommitList = (): boolean => /^commits\//.test(getRepoPath() as string);

export const isCompare = (): boolean => /^compare/.test(getRepoPath() as string);

export const isDashboard = (): boolean => /^$|^(orgs[/][^/]+[/])?dashboard([/]|$)/.test(getCleanPathname());

// TODO: change name to clarify what discussion this is
export const isDiscussion = (): boolean => /^orgs\/[^/]+\/teams\/[^/]+($|\/discussions)/.test(getCleanPathname());

export const isEnterprise = (): boolean => location.hostname !== 'github.com' && location.hostname !== 'gist.github.com';

export const isGist = (): boolean => location.hostname.startsWith('gist.') || location.pathname.startsWith('gist/');

export const isGlobalIssueSearch = (): boolean => location.pathname === '/issues';

export const isGlobalPRSearch = (): boolean => location.pathname === '/pulls';

export const isGlobalSearchResults = (): boolean => location.pathname === '/search' && new URLSearchParams(location.search).get('q') !== null;

export const isIssue = (): boolean => /^issues\/\d+/.test(getRepoPath() as string);

export const isIssueList = (): boolean => /^(issues$|pulls$|labels\/)/.test(getRepoPath() as string);

export const isLabel = (): boolean => /^labels\/\w+/.test(getRepoPath() as string);

export const isLabelList = (): boolean => /^labels\/?(((?=\?).*)|$)/.test(getRepoPath() as string);

export const isMilestone = (): boolean => /^milestone\/\d+/.test(getRepoPath() as string);

export const isMilestoneList = (): boolean => getRepoPath() as string === 'milestones';

export const isNewIssue = (): boolean => /^issues\/new/.test(getRepoPath() as string);

export const isNotifications = (): boolean => /^([^/]+[/][^/]+\/)?notifications/.test(getCleanPathname());

export const isOrganizationProfile = (): boolean => select.exists('.orghead');

export const isOwnUserProfile = (): boolean => getCleanPathname() === getUsername();

// If there's a Report Abuse link, we're not part of the org
export const isOwnOrganizationProfile = (): boolean => isOrganizationProfile() && !select.exists('[href*="contact/report-abuse?report="]');

export const isProject = (): boolean => /^projects\/\d+/.test(getRepoPath() as string);

export const isPR = (): boolean => /^pull\/\d+/.test(getRepoPath() as string);

export const isPRList = (): boolean => getRepoPath() as string === 'pulls';

export const isPRCommit = (): boolean => /^pull\/\d+\/commits\/[0-9a-f]{5,40}/.test(getRepoPath() as string);

export const isPRConversation = (): boolean => /^pull\/\d+$/.test(getRepoPath() as string);

export const isPRFiles = (): boolean => /^pull\/\d+\/files/.test(getRepoPath() as string);

export const isQuickPR = (): boolean => isCompare() && /[?&]quick_pull=1(&|$)/.test(location.search);

export const isReleasesOrTags = (): boolean => /^(releases|tags)/.test(getRepoPath() as string);

export const isRepo = (): boolean => /^[^/]+\/[^/]+/.test(getCleanPathname()) &&
	!isReserved(getOwnerAndRepo().ownerName) &&
	!isNotifications() &&
	!isDashboard() &&
	!isGist() &&
	!isRepoSearch();

export const isRepoRoot = (): boolean => /^(tree[/][^/]+)?$/.test(getRepoPath() as string);

export const isRepoSearch = (): boolean => location.pathname.slice(1).split('/')[2] === 'search';

export const isRepoSettings = (): boolean => /^settings/.test(getRepoPath() as string);

export const isRepoTree = (): boolean => isRepoRoot() || /^tree\//.test(getRepoPath() as string);

export const isSingleCommit = (): boolean => /^commit\/[0-9a-f]{5,40}/.test(getRepoPath() as string);

export const isSingleFile = (): boolean => /^blob\//.test(getRepoPath() as string);

export const isTrending = (): boolean => location.pathname === '/trending' || location.pathname.startsWith('/trending/');

export const isUserProfile = (): boolean => select.exists('.user-profile-nav');
