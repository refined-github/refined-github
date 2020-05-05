import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';

const isSingleHTMLFile = (): boolean => pageDetect.isSingleFile() && (location.pathname.endsWith('.html') || location.pathname.endsWith('.htm'));

function init(): void {
	const rawButton = select<HTMLAnchorElement>('#raw-url')!;
	const link = rawButton.pathname.split('/');
	// Remove /raw/
	link.splice(3, 1);
	rawButton
		.parentElement! // `BtnGroup`
		.prepend(
			<a
				className="btn btn-sm BtnGroup-item"
				href={`https://cdn.statically.io/gh${link.join('/')}`}
			>
				Preview
			</a>
		);
}

features.add({
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
