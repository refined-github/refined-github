import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

function add({parentElement: deleteDirectoryItem}: HTMLAnchorElement): void {
	const item = deleteDirectoryItem!.cloneNode(true);
	const link = item.firstElementChild as HTMLAnchorElement;
	const downloadUrl = new URL('https://download-directory.github.io/');
	downloadUrl.searchParams.set('url', location.href);
	link.href = downloadUrl.href;
	link.textContent = 'Download directory';

	deleteDirectoryItem!.before(item);
}

function init(signal: AbortSignal): void {
	observe('a[aria-keyshortcuts="d"]', add, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoTree,
	],
	exclude: [
		pageDetect.isRepoHome, // Already has an native download ZIP button
		pageDetect.isEnterprise,
		pageDetect.isRepoFile404,
	],
	init,
});

/*

Test URLs

- Own repo: https://github.com/refined-github/refined-github/tree/main/.github
- Archived repo: https://github.com/fregante/object-fit-images/tree/master/demo

*/
