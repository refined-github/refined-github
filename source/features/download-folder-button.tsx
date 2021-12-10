import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {getRepo} from '../github-helpers.js';

function init(): void {
	const downloadUrl = new URL('https://download-directory.github.io/');
	downloadUrl.searchParams.set('url', location.href);

	for (const deleteButton of select.all(`form[action^="/${getRepo()!.nameWithOwner}/tree/delete"]`)) {
		deleteButton.before(
			<a className="dropdown-item rgh-download-folder" href={downloadUrl.href}>
				Download directory
			</a>,
		);
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoTree,
	],
	exclude: [
		pageDetect.isRepoRoot, // Already has an native download ZIP button
	],
	deduplicate: '.rgh-download-folder', // #3945
	init,
});
