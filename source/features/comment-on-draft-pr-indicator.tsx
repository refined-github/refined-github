import React from 'dom-chef';
import InfoIcon from 'octicons-plain-react/Info';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import createBanner from '../github-helpers/banner.js';

function addDraftBanner(newCommentField: HTMLElement): void {
	newCommentField.before(
		createBanner({
			icon: <InfoIcon className="m-0"/>,
			classes: 'p-2 my-2 mx-md-2 text-small color-fg-muted border-0'.split(' '),
			text: <>This is a <strong>draft PR</strong>. Make sure you would like to comment.</>,
		}),
	);
}

function init(signal: AbortSignal): void {
	observe('.CommentBox file-attachment', addDraftBanner, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isDraftPR,
	],
	awaitDomReady: true,
	init,
});

/*

Test URL:

https://github.com/refined-github/sandbox/pull/7

*/
