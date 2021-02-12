import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {getRepo} from '../github-helpers';

function init(): void {
	const downloadUrl = new URL('https://download-directory.github.io/');
	downloadUrl.searchParams.set('url', location.href);

	const folderButtonGroup = select('.file-navigation .BtnGroup.float-right');
	if (folderButtonGroup) {
		folderButtonGroup.prepend(
			<a
				className="btn btn-sm BtnGroup-item"
				href={downloadUrl.href}
			>
				Download
			</a>
		);
	} else {
		// "Repository refresh" layout
		for (const deleteButton of select.all(`form[action^="/${getRepo()!.nameWithOwner}/tree/delete"]`)) {
			deleteButton.before(
				<a className="dropdown-item" href={downloadUrl.href}>
					Download directory
				</a>
			);
		}
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.isRepoTree
	],
	exclude: [
		pageDetect.isRepoRoot // Already has an native download ZIP button
	],
	init
});
