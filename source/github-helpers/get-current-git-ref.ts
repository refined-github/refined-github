import {isRepoCommitList} from 'github-url-detection';
import {$} from 'select-dom';

import {extractCurrentBranchFromBranchPicker} from './index.js';
import {branchSelector} from './selectors.js';

const typesWithGitRef = new Set(['tree', 'blob', 'blame', 'edit', 'commit', 'commits', 'compare']);
const titleWithGitRef = / at (?<branch>[.\w-/]+)( · [\w-]+\/[\w-]+)?$/i;

/** Must not be async because it's used by GitHubFileURL. May return different results depending on whether it's called before or after DOM ready */
export default function getCurrentGitRef(): string | undefined {
	// Note: This is not in the <head> so it's only available on AJAXed loads.
	// It appears on every Code page except `commits` on folders/files
	const picker = $(branchSelector);
	const refViaPicker = picker && extractCurrentBranchFromBranchPicker(picker);
	if (refViaPicker) {
		return refViaPicker;
	}

	// Slashed branches on `commits`, including pages without a branch picker
	const branchFromFeed = getCurrentBranchFromFeed();
	if (branchFromFeed) {
		return branchFromFeed;
	}

	return getGitRef(location.pathname, document.title);
}

export function getGitRef(pathname: string, title: string): string | undefined {
	if (!pathname.startsWith('/')) {
		throw new TypeError(`Expected pathname starting with /, got "${pathname}"`);
	}

	const [type, gitRefIfNonSlashed] = pathname.split('/').slice(3);
	if (!type || !typesWithGitRef.has(type)) {
		// Root; or piece of information not applicable to the page
		return;
	}

	// Slashed branches on `blob` and `tree`
	const parsedTitle = titleWithGitRef.exec(title);
	if (parsedTitle) {
		return parsedTitle.groups!.branch;
	}

	// Couldn't ensure it's not slashed, so we'll return the first piece whether correct or not
	return gitRefIfNonSlashed;
}

// In <head>, but not reliable https://github.com/refined-github/refined-github/assets/1402241/50357d94-505f-48dc-bd54-74e86b19d642
function getCurrentBranchFromFeed(): string | undefined {
	const feedLink = isRepoCommitList() && $('link[type="application/atom+xml"]');
	if (!feedLink) {
		// Do not throw errors, the element may be missing after AJAX navigation even if on the right page
		return;
	}

	return new URL(feedLink.href)
		.pathname
		.split('/')
		.slice(4) // Drops the initial /user/repo/route/ part
		.join('/')
		.replace(/\.atom$/, '');
}
