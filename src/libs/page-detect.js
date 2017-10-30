import select from 'select-dom';

// - xo complains if you don't use .startsWith
// but getRepoPath returns undefined if it doesn't find a repo
// so .test(X) works but X.startsWith() doesn't
/* eslint-disable unicorn/prefer-starts-ends-with */

export const isGist = () => location.hostname.startsWith('gist.') || location.pathname.startsWith('gist/');

export const isDashboard = () => location.pathname === '/' || /^(\/orgs\/[^/]+)?\/dashboard/.test(location.pathname);

export const isTrending = () => location.pathname.startsWith('/trending');

export const isEnterprise = () => location.hostname !== 'github.com' && location.hostname !== 'gist.github.com';

export const isNotifications = () => /^\/(?:[^/]+\/[^/]+\/)?notifications/.test(location.pathname);

// @todo Replace with DOM-based test because this is too generic #708
export const isRepo = () => /^\/[^/]+\/[^/]+/.test(location.pathname) &&
	!isGist() &&
	!isTrending() &&
	!isNotifications();

export const getRepoPath = () => (/^(?:[/][^/]+){2}[/]?(.*)$/.exec(location.pathname.replace(/[/]$/, '')) || [])[1];

export const getRepoURL = () => location.pathname.slice(1).split('/', 2).join('/');

export const isRepoRoot = () => /^(tree[/][^/]+)?$/.test(getRepoPath());

export const isRepoTree = () => /^tree\//.test(getRepoPath());

export const isIssueSearch = () => location.pathname.startsWith('/issues');

export const isIssueList = () => /^issues\/?$/.test(getRepoPath());

export const isIssue = () => /^issues\/\d+/.test(getRepoPath());

export const isPRSearch = () => location.pathname.startsWith('/pulls');

export const isPRList = () => /^pulls\/?$/.test(getRepoPath());

export const isPR = () => /^pull\/\d+/.test(getRepoPath());

export const isPRFiles = () => /^pull\/\d+\/files/.test(getRepoPath());

export const isPRCommit = () => /^pull\/\d+\/commits\/[0-9a-f]{5,40}/.test(getRepoPath());

export const isMilestoneList = () => /^milestones\/?$/.test(getRepoPath());

export const isMilestone = () => /^milestone\/\d+/.test(getRepoPath());

export const isLabelList = () => /^labels\/?(((?=\?).*)|$)/.test(getRepoPath());

export const isLabel = () => /^labels\/\w+/.test(getRepoPath());

export const isCommitList = () => /^commits\//.test(getRepoPath());

export const isSingleCommit = () => /^commit\/[0-9a-f]{5,40}/.test(getRepoPath());

export const isCommit = () => isSingleCommit() || isPRCommit() || (isPRFiles() && select.exists('.full-commit'));

export const isCompare = () => /^compare/.test(getRepoPath());

export const isQuickPR = () => isCompare() && /[?&]quick_pull=1(&|$)/.test(location.search);

export const isReleases = () => /^(releases|tags)/.test(getRepoPath());

export const isBlame = () => /^blame\//.test(getRepoPath());

export const isRepoSettings = () => /^settings/.test(getRepoPath());

export const getOwnerAndRepo = () => {
	const [, ownerName, repoName] = location.pathname.split('/');

	return {
		ownerName,
		repoName
	};
};

export const isSingleFile = () => /^blob\//.test(getRepoPath());

export const hasCommentForm = () => select.exists('.js-previewable-comment-form');
