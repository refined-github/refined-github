import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';

function init(): void {
	const buttonGroup = select('.file-navigation .BtnGroup.float-right');
	if (buttonGroup) {
		buttonGroup.prepend(
			<a
				className="btn btn-sm BtnGroup-item"
				href={`https://download-directory.github.io/?url=${location.href}`}
			>
				Download
			</a>
		);
	}
}

features.add({
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
