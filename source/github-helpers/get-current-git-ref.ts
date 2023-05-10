import select from 'select-dom';

const typesWithGitRef = new Set(['tree', 'blob', 'blame', 'edit', 'commit', 'commits', 'compare']);
const titleWithGitRef = / at (?<branch>[.\w-/]+)( · [\w-]+\/[\w-]+)?$/i;

/** Must not be async because it's used by GitHubURL. May return different results depending on whether it's called before or after DOM ready */
export default function getCurrentGitRef(): string | undefined {
	// There are usually 2 elements on the page; 4 on the compare page.
	// Note: This is not in the <head> so it's only available on AJAXed loads.
	const refViaPicker = select('ref-selector')?.getAttribute('current-committish');
	if (refViaPicker) {
		return refViaPicker;
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
