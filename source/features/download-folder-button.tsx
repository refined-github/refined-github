import './download-folder-button.css';

import React from 'dom-chef';
import {DownloadIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

function addLegacy(folderDropdown: HTMLElement): void {
	const downloadUrl = new URL('https://download-directory.github.io/');
	downloadUrl.searchParams.set('url', location.href);

	folderDropdown.before(
		<a
			className="rgh-download-folder-button btn tooltipped tooltipped-nw"
			aria-label="Download directory"
			href={downloadUrl.href}
		>
			<DownloadIcon/>
		</a>,
	);
}

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

	// TODO: Drop in late 2023. Old file view #6154
	observe('[aria-label="Add file"] + details', addLegacy, {signal});
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
