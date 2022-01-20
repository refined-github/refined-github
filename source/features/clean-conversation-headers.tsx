import './clean-conversation-headers.css';
import React from 'dom-chef';
import select from 'select-dom';
import elementReady from 'element-ready';
import {ArrowLeftIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import features from '.';
import getDefaultBranch from '../github-helpers/get-default-branch';
import onConversationHeaderUpdate from '../github-events/on-conversation-header-update';

async function initIssue(): Promise<void> {
	const byline = await elementReady('.gh-header-meta .flex-auto:not(.rgh-clean-conversation-headers)');
	if (!byline) {
		return;
	}

	byline.classList.add('rgh-clean-conversation-headers', 'rgh-clean-conversation-headers-hide-author');

	// Shows on issues: octocat opened this issue on 1 Jan · [1 comments]
	// Removes on issues: octocat opened this issue on 1 Jan [·] 1 comments
	const commentCount = select('relative-time', byline)!.nextSibling!;
	commentCount.replaceWith(<span>{commentCount.textContent!.replace('·', '')}</span>);
}

async function initPR(): Promise<void> {
	const byline = await elementReady('.gh-header-meta .flex-auto:not(.rgh-clean-conversation-headers)');
	if (!byline) {
		return;
	}

	byline.classList.add('rgh-clean-conversation-headers');

	// Extra author name is only shown on `isPRConversation`
	// Hide if it's the same as the opener (always) or merger
	const shouldHideAuthor = pageDetect.isPRConversation() && select('.author', byline)!.textContent === (await elementReady('.TimelineItem .author'))!.textContent;
	if (shouldHideAuthor) {
		byline.classList.add('rgh-clean-conversation-headers-hide-author');
	}

	const base = select('.commit-ref', byline)!;
	const baseBranch = base.title.split(':')[1];

	// Shows on PRs: main [←] feature
	base.nextElementSibling!.replaceChildren(<ArrowLeftIcon className="v-align-middle mx-1"/>);

	const wasDefaultBranch = pageDetect.isClosedPR() && baseBranch === 'master';
	const isDefaultBranch = baseBranch === await getDefaultBranch();
	if (!isDefaultBranch && !wasDefaultBranch) {
		base.classList.add('rgh-clean-conversation-headers-non-default-branch');
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isIssue,
	],
	additionalListeners: [
		onConversationHeaderUpdate,
	],
	awaitDomReady: false,
	deduplicate: 'has-rgh-inner',
	init: initIssue,
}, {
	include: [
		pageDetect.isPR,
	],
	additionalListeners: [
		onConversationHeaderUpdate,
	],
	awaitDomReady: false,
	deduplicate: 'has-rgh-inner',
	init: initPR,
});
