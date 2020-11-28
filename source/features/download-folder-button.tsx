import React from 'dom-chef';
import select from 'select-dom';
import {DownloadIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import features from '.';

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
		select('.file-navigation > .d-flex:last-child')!.append(
			<a
				className="btn ml-2"
				href={downloadUrl.href}
			>
				<DownloadIcon className="mr-1"/>
				Download
			</a>
		);
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
