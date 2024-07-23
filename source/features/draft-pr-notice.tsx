import React from 'dom-chef';
import GitPullRequestDraftIcon from 'octicons-plain-react/GitPullRequestDraft';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import createBanner from '../github-helpers/banner.js';
import {isOwnConversation} from '../github-helpers/index.js';
import {newCommentField} from '../github-helpers/selectors.js';

function addDraftBanner(newCommentField: HTMLElement): void {
	newCommentField.before(
		createBanner({
			icon: <GitPullRequestDraftIcon className="m-0"/>,
			classes: 'p-2 my-2 mx-md-2 text-small color-fg-muted border-0'.split(' '),
			text: <>This is a <strong>draft PR</strong>, it might not be ready for review.</>,
		}),
	);
}

function init(signal: AbortSignal): void {
	observe(newCommentField, addDraftBanner, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isDraftPR,
	],
	exclude: [
		isOwnConversation,
	],
	awaitDomReady: true,
	init,
});

/*

Test URL:

https://github.com/refined-github/sandbox/pull/7

*/
