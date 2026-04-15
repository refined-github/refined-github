import React from 'dom-chef';
import {$, $optional} from 'select-dom/strict.js';
import * as pageDetect from 'github-url-detection';
import DownloadIcon from 'octicons-plain-react/Download';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import replaceElementTypeInPlace from '../helpers/recreate-element.js';

function add(menu: HTMLUListElement): void {
	const downloadUrl = new URL('https://download-directory.github.io/');
	downloadUrl.searchParams.set('url', location.href);

	const item = menu.firstElementChild!.cloneNode(true);
	item.role = 'none';
	item.removeAttribute('tabindex');
	item.removeAttribute('id');
	item.removeAttribute('aria-keyshortcuts');
	item.removeAttribute('aria-labelledby');

	const link = item.firstElementChild instanceof HTMLAnchorElement
		? item.firstElementChild
		// Not a link on permalinks and archived repos
		: replaceElementTypeInPlace(item.firstElementChild!, 'a');
	link.href = downloadUrl.href;
	link.classList.add('no-underline', 'fgColor-inherit');
	link.setAttribute('aria-keyshortcuts', 'c');

	// Missing on permalinks and archived repos
	$optional('svg', link)?.replaceWith(<DownloadIcon />);

	// Only on permalinks and archived repos
	$optional('[id$="--trailing-visual"]', link)?.remove();

	$('[id$="--label"]', link).textContent = 'Download directory';

	menu.prepend(item);
}

function init(signal: AbortSignal): void {
	observe('ul[role="menu"]:has([aria-keyshortcuts="c"])', add, {signal});
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
