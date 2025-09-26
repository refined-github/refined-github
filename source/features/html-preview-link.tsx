import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

const isSingleHTMLFile = (): boolean => pageDetect.isSingleFile() && /\.html?$/.test(location.pathname);

function add(rawButton: HTMLAnchorElement): void {
	if (!pageDetect.isPublicRepo()) {
		return;
	}

	rawButton
		.parentElement! // `div`
		.parentElement! // `BtnGroup`
		.prepend(
			<div>
				<a
					className={rawButton.className}
					data-variant="default"
					data-size="small"
					// #3305
					href={`https://refined-github-html-preview.kidonng.workers.dev${rawButton.pathname}`}
				>
					Preview
				</a>
			</div>,
		);
}

function init(signal: AbortSignal): void {
	observe(['a#raw-url', 'a[data-testid="raw-button"]'], add, {signal});
}

void features.add(import.meta.url, {
	include: [
		isSingleHTMLFile,
	],
	exclude: [
		pageDetect.isEnterprise,
	],
	init,
});

/*

Test URLs:

https://github.com/refined-github/sandbox/blob/html/preview-link/public/test.html
https://github.com/CodingTrain/website/blob/4f90eedb9618257d9166241e92e51a7f3f00a08e/code_challenges/PerlinNoiseTerrain_p5.js/index.html

*/
