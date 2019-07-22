import React from 'dom-chef';
import select from 'select-dom';
import copyToClipboard from 'copy-text-to-clipboard';
import delegate from 'delegate-it';
import features from '../libs/features';

function getURLDetails(url: string): string {
	return url.replace(/http(s|):\/\/github.com|blob\/\w+\//gi, '');
}

function handleClick(): void {
	const baseURL = 'https://cdn.jsdelivr.net/gh';

	// Get "<username>/<repo>/<path-to-file>" removing "blob/<branch>"
	const path = getURLDetails(window.location.href);

	// https://cdn.jsdelivr.net/gh/sindresorhus/refined-github/contributing.md
	const cdnURL = baseURL + path;

	copyToClipboard(cdnURL);
}

function renderButton(): void {
	for (const blameButton of select.all('[data-hotkey="b"]')) {
		blameButton.parentElement!.prepend(
			<button
				onClick={handleClick}
				className="btn btn-sm tooltipped tooltipped-n BtnGroup-item rgh-copy-file"
				aria-label="Copy JSDelivr CDN url"
				type="button">
				Copy CDN
			</button>,
		);
	}
}

function init(): void {
	if (select.exists('.blob.instapaper_body')) {
		delegate('.rgh-md-source', 'rgh:view-markdown-source', renderButton);
		delegate('.rgh-md-source', 'rgh:view-markdown-rendered', () => {
			const button = select('.rgh-copy-file');
			if (button) {
				button.remove();
			}
		});
	} else {
		renderButton();
	}
}

features.add({
	id: __featureName__,
	description: 'Generate a CDN url for the current file via https://jsdelivr.com',
	include: [features.isSingleFile],
	exclude: [features.isRepoRoot, features.isGist],
	load: features.onAjaxedPages,
	init
});
