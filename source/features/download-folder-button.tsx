import React from 'dom-chef';
import select from 'select-dom';
import DownloadIcon from 'octicon/download.svg';
import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): void {
	const folderButtonGroup = select('.file-navigation .BtnGroup.float-right');
	if (folderButtonGroup) {
		folderButtonGroup.prepend(
			<a
				className="btn btn-sm BtnGroup-item"
				href={`https://download-directory.github.io/?url=${location.href}`}
			>
				Download
			</a>
		);
	} else {
		// "Repository refresh" layout
		select('.file-navigation > .d-flex')!.append(
			<a
				className="btn ml-2"
				href={`https://download-directory.github.io/?url=${location.href}`}
			>
				<DownloadIcon className="mr-1"/>
				Download
			</a>
		);
	}
}

void features.add({
	id: __filebasename,
	description: 'Adds a button to a download button entire folders, via https://download-directory.github.io',
	screenshot: 'https://user-images.githubusercontent.com/1402241/35044451-fd3e2326-fbc2-11e7-82e1-61ec7bee612b.png'
}, {
	include: [
		pageDetect.isRepoTree
	],
	exclude: [
		pageDetect.isRepoRoot // Already has an native download ZIP button
	],
	init
});
