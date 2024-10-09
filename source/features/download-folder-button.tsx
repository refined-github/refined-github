import './download-folder-button.css';
import * as pageDetect from 'github-url-detection';
import {$} from 'select-dom';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

function add(container: HTMLElement): void {
	const deleteDirectoryItem = $('[aria-keyshortcuts="c"]:first-child', container);

	if (!deleteDirectoryItem)
		return;

	const item = deleteDirectoryItem!.cloneNode(true);
	item.replaceChildren(document.createElement('a'));

	const link = item.firstElementChild as HTMLAnchorElement;
	const downloadUrl = new URL('https://download-directory.github.io/');
	downloadUrl.searchParams.set('url', location.href);
	link.href = downloadUrl.href;
	link.textContent = 'Download directory';
	link.classList.add('download-button');
	link.removeAttribute('id');
	link.removeAttribute('aria-keyshortcuts');
	link.removeAttribute('aria-labelledby');

	deleteDirectoryItem?.before(item);
}

function init(signal: AbortSignal): void {
	observe('ul[role="menu"]', add, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoTree,
	],
	exclude: [
		pageDetect.isRepoRoot, // Already has an native download ZIP button
		pageDetect.isEnterprise,
	],
	init,
});

/*

Test URLs

- Own repo: https://github.com/refined-github/refined-github/tree/main/.github
- Archived repo: https://github.com/fregante/object-fit-images/tree/master/demo

*/
