/* eslint-disable unicorn/prefer-starts-ends-with */
/* The tested var might not be a string */

import select from 'select-dom';
import reservedNames from 'github-reserved-names/reserved-names.json';
import {getUsername, getCleanPathname, getRepoPath, getOwnerAndRepo} from './utils';

export const is404 = (): boolean => document.title === 'Page not found · GitHub';

export const is500 = (): boolean => document.title === 'Server Error · GitHub' || document.title === 'Unicorn! · GitHub';

export const isBlame = (): boolean => /^blame\//.test(getRepoPath());

export const isCommit = (): boolean => isSingleCommit() || isPRCommit();

export const isCommitList = (): boolean => /^commits\//.test(getRepoPath());

export const isCompare = (): boolean => /^compare/.test(getRepoPath());

export const isDashboard = (): boolean => !isGist() && /^$|^(orgs[/][^/]+[/])?dashboard([/]|$)/.test(getCleanPathname());

export const isEnterprise = (): boolean => location.hostname !== 'github.com' && location.hostname !== 'gist.github.com';

export const isGist = (): boolean => location.hostname.startsWith('gist.') || location.pathname.startsWith('gist/');

export const isGlobalIssueSearch = (): boolean => location.pathname === '/issues';

export const isGlobalPRSearch = (): boolean => location.pathname === '/pulls';

export const isGlobalSearchResults = (): boolean => location.pathname === '/search' && new URLSearchParams(location.search).get('q') !== null;

export const isIssue = (): boolean => /^issues\/\d+/.test(getRepoPath());

export const isIssueList = (): boolean => /^(issues$|pulls$|labels\/)/.test(getRepoPath());

export const isLabel = (): boolean => /^labels\/\w+/.test(getRepoPath());

export const isLabelList = (): boolean => /^labels\/?(((?=\?).*)|$)/.test(getRepoPath());

export const isMilestone = (): boolean => /^milestone\/\d+/.test(getRepoPath());

export const isMilestoneList = (): boolean => getRepoPath() === 'milestones';

export const isNewIssue = (): boolean => /^issues\/new/.test(getRepoPath());

export const isNotifications = (): boolean => /^([^/]+[/][^/]+\/)?notifications/.test(getCleanPathname());

export const isOrganizationProfile = (): boolean => select.exists('.orghead');

export const isOrganizationDiscussion = (): boolean => /^orgs\/[^/]+\/teams\/[^/]+($|\/discussions)/.test(getCleanPathname());

export const isOwnUserProfile = (): boolean => getCleanPathname() === getUsername();

// If there's a Report Abuse link, we're not part of the org
export const isOwnOrganizationProfile = (): boolean => isOrganizationProfile() && !select.exists('[href*="contact/report-abuse?report="]');

export const isProject = (): boolean => /^projects\/\d+/.test(getRepoPath());

export const isPR = (): boolean => /^pull\/\d+/.test(getRepoPath());

export const isPRList = (): boolean => getRepoPath() === 'pulls';

export const isPRCommit = (): boolean => /^pull\/\d+\/commits\/[0-9a-f]{5,40}/.test(getRepoPath());

export const isPRConversation = (): boolean => /^pull\/\d+$/.test(getRepoPath());

export const isPRFiles = (): boolean => /^pull\/\d+\/files/.test(getRepoPath());

export const isQuickPR = (): boolean => isCompare() && /[?&]quick_pull=1(&|$)/.test(location.search);

export const isReleasesOrTags = (): boolean => /^(releases|tags)/.test(getRepoPath());

export const isRepo = (): boolean => /^[^/]+\/[^/]+/.test(getCleanPathname()) &&
	!reservedNames.includes(getOwnerAndRepo().ownerName) &&
	!isNotifications() &&
	!isDashboard() &&
	!isGist() &&
	!isRepoSearch();

export const isRepoRoot = (): boolean => /^(tree[/][^/]+)?$/.test(getRepoPath());

export const isRepoSearch = (): boolean => location.pathname.slice(1).split('/')[2] === 'search';

export const isRepoSettings = (): boolean => /^settings/.test(getRepoPath());

export const isRepoTree = (): boolean => isRepoRoot() || /^tree\//.test(getRepoPath());

export const isSingleCommit = (): boolean => /^commit\/[0-9a-f]{5,40}/.test(getRepoPath());

export const isSingleFile = (): boolean => /^blob\//.test(getRepoPath());

export const isTrending = (): boolean => location.pathname === '/trending' || location.pathname.startsWith('/trending/');

export const isUserProfile = (): boolean => select.exists('.user-profile-nav');

export const hasComments = (): boolean =>
	isPR() ||
	isIssue() ||
	isCommit() ||
	isOrganizationDiscussion();

export const hasRichTextEditor = (): boolean =>
	hasComments() ||
	isNewIssue() ||
	isCompare();
