import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

const isSingleHTMLFile = (): boolean => pageDetect.isSingleFile() && (location.pathname.endsWith('.html') || location.pathname.endsWith('.htm'));

function init(): void {
	const rawButton = select<HTMLAnchorElement>('#raw-url')!;
	const link = rawButton.pathname.split('/');
	link.splice(3, 1); // Remove /raw/
	rawButton
		.parentElement! // `BtnGroup`
		.prepend(
			<a
				className="btn btn-sm BtnGroup-item"
				href={`https://ghcdn.rawgit.org${link.join('/')}`}
			>
				Preview
			</a>
		);
}

void features.add({
	id: __filebasename,
	description: 'Adds a link to preview HTML files.',
	screenshot: 'https://user-images.githubusercontent.com/44045911/67634792-48995980-f8fb-11e9-8b6a-7b57d5b12a2f.png'
}, {
	include: [
		isSingleHTMLFile
	],
	exclude: [
		pageDetect.isEnterprise
	],
	init
});
