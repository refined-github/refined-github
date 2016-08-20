window.pageDetect = (() => {
	const isGist = () => location.hostname === 'gist.github.com';

	const isDashboard = () => location.pathname === '/' || /^(\/orgs\/[^\/]+)?\/dashboard/.test(location.pathname);

	const isRepo = () => !isGist() && /^\/[^/]+\/[^/]+/.test(location.pathname);

	const getRepoPath = () => location.pathname.replace(/^\/[^/]+\/[^/]+/, '');

	const isRepoRoot = () => isRepo() && /^(\/?$|\/tree\/)/.test(getRepoPath()) && $('.repository-meta-content').length > 0;

	const isRepoTree = () => isRepo() && /\/tree\//.test(getRepoPath());

	const isIssueList = () => isRepo() && /^\/issues\/?$/.test(getRepoPath());

	const isIssue = () => isRepo() && /^\/issues\/\d+/.test(getRepoPath());

	const isPRList = () => isRepo() && /^\/pulls\/?$/.test(getRepoPath());

	const isPR = () => isRepo() && /^\/pull\/\d+/.test(getRepoPath());

	const isPRFiles = () => isRepo() && /^\/pull\/\d+\/files/.test(getRepoPath());

	const isPRCommit = () => isRepo() && /^\/pull\/\d+\/commits\/[0-9a-f]{5,40}/.test(getRepoPath());

	const isCommitList = () => isRepo() && /^\/commits\//.test(getRepoPath());

	const isSingleCommit = () => isRepo() && /^\/commit\/[0-9a-f]{5,40}/.test(getRepoPath());

	const isCommit = () => isSingleCommit() || isPRCommit() || (isPRFiles() && $('.full-commit').length > 0);

	const isReleases = () => isRepo() && /^\/(releases|tags)/.test(getRepoPath());

	const isBlame = () => isRepo() && /^\/blame\//.test(getRepoPath());

	const isNotifications = () => /\/notifications(\/participating)?/.test(location.pathname);

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

	return {
		isGist,
		isDashboard,
		isRepo,
		isRepoRoot,
		isRepoTree,
		isIssueList,
		isIssue,
		isPRList,
		isPR,
		isPRFiles,
		isPRCommit,
		isCommitList,
		isSingleCommit,
		isCommit,
		isReleases,
		isBlame,
		isNotifications,
		getOwnerAndRepo,
		isSingleFile
	};
})();
