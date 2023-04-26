import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import observe from '../helpers/selector-observer';

const isSingleHTMLFile = (): boolean => pageDetect.isSingleFile() && /\.html?$/.test(location.pathname);

function add(rawButton: HTMLAnchorElement): void {
	if (!pageDetect.isPublicRepo()) {
		return;
	}

	rawButton
		.parentElement! // `BtnGroup`
		.prepend(
			<a
				className="btn btn-sm BtnGroup-item"
				// #3305
				href={`https://refined-github-html-preview.kidonng.workers.dev${rawButton.pathname}`}
			>
				Preview
			</a>,
		);
}

function init(signal: AbortSignal): void {
	observe('a:is(#raw-url, [data-testid="raw-button"])', add, {signal});
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
