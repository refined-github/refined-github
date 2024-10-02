import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import GitHubFileURL from '../github-helpers/github-file-url.js';

function scrollToCurrentFile(): void {
	const url = new GitHubFileURL(location.href);
	const filePath = url.filePath;

	// we need to escape the filePath if we use querySelector.
	// eslint-disable-next-line unicorn/prefer-query-selector
	const item = document.getElementById(`${filePath}-item`);
	const text = item?.querySelector('.PRIVATE_TreeView-item-content-text');
	text?.scrollIntoView({block: 'center', behavior: 'auto'});
}

function init(signal: AbortSignal): void {
	signal.addEventListener('abort', unload);

	// After the file navigation
	window.addEventListener('turbo:load', scrollToCurrentFile);

	// After expanding the file tree
	document.addEventListener('soft-nav:end', scrollToCurrentFile);

	// After navigating back to a repo tree or a single file page from other tabs (e.g. Issues, Pull requests)
	scrollToCurrentFile();
}

function unload(): void {
	// After the file navigation
	window.removeEventListener('turbo:load', scrollToCurrentFile);

	// After expanding the file tree
	document.removeEventListener('soft-nav:end', scrollToCurrentFile);
}

void features.add(import.meta.url, {
	asLongAs: [
		pageDetect.isLoggedIn,
	],
	include: [
		pageDetect.isRepoTree,
		pageDetect.isSingleFile,
	],
	init,
	awaitDomReady: true,
});

/*

Test URLs:

https://github.com/refined-github/refined-github/tree/main/source/features (on directory)
https://github.com/refined-github/refined-github/blob/main/source/refined-github.ts (on file)

*/
