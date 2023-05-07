import {getCurrentBranchFromFeed} from './index.js';

const typesWithGitRef = new Set(['tree', 'blob', 'blame', 'edit', 'commit', 'commits', 'compare']);
const titleWithGitRef = / at (?<branch>[.\w-/]+)( · [\w-]+\/[\w-]+)?$/i;

/** This only works with URL and page title. Must not be async because it's used by GitHubURL */
export default function getCurrentGitRef(pathname = location.pathname, title = document.title): string | undefined {
	if (!pathname.startsWith('/')) {
		throw new TypeError(`Expected pathname starting with /, got "${pathname}"`);
	}

	const [type, gitRefIfNonSlashed] = pathname.split('/').slice(3);
	if (!type || !typesWithGitRef.has(type)) {
		// Root; or piece of information not applicable to the page
		return;
	}

	// Slashed branches on `commits`
	if (type === 'commits') {
		return getCurrentBranchFromFeed()!;
	}

	// Slashed branches on `blob` and `tree`
	const parsedTitle = titleWithGitRef.exec(title);
	if (parsedTitle) {
		return parsedTitle.groups!.branch;
	}

	// Couldn't ensure it's not slashed, so we'll return the first piece whether correct or not
	return gitRefIfNonSlashed;
}
