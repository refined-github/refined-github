import getDefaultBranch from './get-default-branch.js';
import getCurrentGitRef from './get-current-git-ref.js';

/** Detects if the current view is on the default branch. To be used on file/folder/commit lists */
export default async function isDefaultBranch(): Promise<boolean> {
	const currentBranch = getCurrentGitRef();
	if (!currentBranch) {
		// This happens on the repo root OR on views that are not branch-specific (like isIssue)
		return true;
	}

	return currentBranch === await getDefaultBranch();
}
