import './download-folder-button.css';

import React from 'dom-chef';
import {DownloadIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import observe from '../helpers/selector-observer';

function add(folderDropdown: HTMLElement): void {
	folderDropdown.parentElement!.querySelector('a.rgh-download-folder-button')?.remove()

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

function init(signal: AbortSignal): void {
	observe([
		'[title="More options"]',	// pageDetect.isRepoTree
		'[title="More file actions"]', // pageDetect.isSingleFile
		'[aria-label="Add file"] + details', // TODO: Drop in mid 2023. Old file view #6154
	], add, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoTree,
		pageDetect.isSingleFile,
	],
	exclude: [
		pageDetect.isRepoRoot, // Already has an native download ZIP button
	],
	init,
});

/*

Test URLs

- Own repo: https://github.com/refined-github/refined-github/tree/main/.github
- Archived repo: https://github.com/fregante/object-fit-images/tree/master/demo

*/
