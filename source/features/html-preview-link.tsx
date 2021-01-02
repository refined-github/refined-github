import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

const isSingleHTMLFile = (): boolean => pageDetect.isSingleFile() && /\.html?$/.test(location.pathname);

function init(): void {
	const rawButton = select('a#raw-url')!;
	rawButton
		.parentElement! // `BtnGroup`
		.prepend(
			<a
				className="btn btn-sm BtnGroup-item"
				href={`https://refined-github-html-preview.kidonng.workers.dev${rawButton.pathname}`}
			>
				Preview
			</a>
		);
}

void features.add(__filebasename, {
	include: [
		isSingleHTMLFile
	],
	exclude: [
		pageDetect.isEnterprise
	],
	init
});
