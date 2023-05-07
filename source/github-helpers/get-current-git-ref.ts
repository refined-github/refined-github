import getDefaultBranch from './get-default-branch';
import {getCurrentBranchFromFeed} from './index';

const typesWithGitRef = new Set(['tree', 'blob', 'blame', 'edit', 'commit', 'commits', 'compare']);
const titleWithGitRef = / at (?<branch>[.\w-/]+)( · [\w-]+\/[\w-]+)?$/i;

/** This only works with URL and page title */
export default function getCurrentGitRef(pathname = location.pathname, title = document.title): string | undefined {
	if (!pathname.startsWith('/')) {
		throw new TypeError(`Expected pathname starting with /, got "${pathname}"`);
	}

	const [type, gitRefIfNonSlashed] = pathname.split('/').slice(3);

	// Handle slashed branches in commits pages
	if (type === 'commits') {
		return getCurrentBranchFromFeed()!;
	}

	if (!type || !typesWithGitRef.has(type)) {
		// Root; or piece of information not applicable to the page
		return;
	}

	// `blob` and `tree`
	const parsedTitle = titleWithGitRef.exec(title);
	if (parsedTitle) {
		return parsedTitle.groups!.branch;
	}

	return gitRefIfNonSlashed;
}

/** Detects if the current view is on the default branch. To be used on file/folder/commit lists */
export async function isDefaultBranch(): Promise<boolean> {
	const currentBranch = getCurrentGitRef();
	if (!currentBranch) {
		// The URL doesn't contain any refs, so it's definitely the default branch
		return true;
	}

	return currentBranch === await getDefaultBranch();
}
