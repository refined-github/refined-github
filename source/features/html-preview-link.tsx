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
				className="btn btn-sm BtnGroup-item rgh-html-preview-link"
				// #3305
				href={`https://refined-github-html-preview.kidonng.workers.dev${rawButton.pathname}`}
			>
				Preview
			</a>,
		);
}

void features.add(import.meta.url, {
	include: [
		isSingleHTMLFile,
	],
	exclude: [
		pageDetect.isEnterprise,
	],
	deduplicate: '.rgh-html-preview-link', // #3945
	init,
});
