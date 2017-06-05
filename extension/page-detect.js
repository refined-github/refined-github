/* globals utils */

window.pageDetect = (() => {
	const isGist = () => location.hostname === 'gist.github.com';

	const isDashboard = () => location.pathname === '/' || /^(\/orgs\/[^/]+)?\/dashboard/.test(location.pathname);

	const isRepo = () => !isGist() && /^\/[^/]+\/[^/]+/.test(location.pathname);

	const getRepoPath = () => location.pathname.replace(/^\/[^/]+\/[^/]+/, '');

	const isRepoRoot = () => isRepo() && /^(\/?$|\/tree\/)/.test(getRepoPath()) && utils.exists('.repository-meta-content');

	const isRepoTree = () => isRepo() && /\/tree\//.test(getRepoPath());

	const isIssueSearch = () => location.pathname.startsWith('/issues');

	const isIssueList = () => isRepo() && /^\/issues\/?$/.test(getRepoPath());

	const isIssue = () => isRepo() && /^\/issues\/\d+/.test(getRepoPath());

	const isPRSearch = () => location.pathname.startsWith('/pulls');

	const isPRList = () => isRepo() && /^\/pulls\/?$/.test(getRepoPath());

	const isPR = () => isRepo() && /^\/pull\/\d+/.test(getRepoPath());

	const isPRFiles = () => isRepo() && /^\/pull\/\d+\/files/.test(getRepoPath());

	const isPRCommit = () => isRepo() && /^\/pull\/\d+\/commits\/[0-9a-f]{5,40}/.test(getRepoPath());

	const isMilestone = () => isRepo() && /^\/milestone\/\d+/.test(getRepoPath());

	const isCommitList = () => isRepo() && /^\/commits\//.test(getRepoPath());

	const isSingleCommit = () => isRepo() && /^\/commit\/[0-9a-f]{5,40}/.test(getRepoPath());

	const isCommit = () => isSingleCommit() || isPRCommit() || (isPRFiles() && utils.exists('.full-commit'));

	const isCompare = () => isRepo() && /^\/compare/.test(getRepoPath());

	const hasCode = () => isRepo() && utils.exists('.blob-code-inner');

	const hasDiff = () => isRepo() && (isSingleCommit() || isPRCommit() || isPRFiles() || isCompare() || (isPR() && utils.exists('.diff-table')));

	const isReleaseList = () => isRepo() && /^\/(releases|tags)\/?$/.test(getRepoPath());

	const isRelease = () => isRepo() && /^\/releases\/tag/.test(getRepoPath());

	const isBlame = () => isRepo() && /^\/blame\//.test(getRepoPath());

	const isNotifications = () => /\/notifications(\/participating)?/.test(location.pathname);

	const isRepoSettings = () => isRepo() && /^\/settings/.test(getRepoPath());

	const getOwnerAndRepo = () => {
		const [, ownerName, repoName] = location.pathname.split('/');

		return {
			ownerName,
			repoName
		};
	};

	const isSingleFile = () => {
		const {ownerName, repoName} = getOwnerAndRepo();
		const blobPattern = new RegExp(`/${ownerName}/${repoName}/blob/`);
		return isRepo() && blobPattern.test(location.href);
	};

	const hasCommentForm = () => utils.exists('.js-previewable-comment-form');

	return {
		isGist,
		isDashboard,
		isRepo,
		isRepoRoot,
		isRepoTree,
		isIssueSearch,
		isIssueList,
		isIssue,
		isPRSearch,
		isPRList,
		isPR,
		isPRFiles,
		isPRCommit,
		isMilestone,
		isCommitList,
		isSingleCommit,
		isCommit,
		isCompare,
		hasCode,
		hasDiff,
		isReleaseList,
		isRelease,
		isBlame,
		isNotifications,
		getOwnerAndRepo,
		isSingleFile,
		hasCommentForm,
		isRepoSettings
	};
})();
