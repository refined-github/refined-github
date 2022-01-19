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
	const byline = await elementReady('.gh-header-meta .flex-auto:not(.rgh-clean-conversation-header)');
	if (!byline) {
		return;
	}

	byline.classList.add('rgh-clean-conversation-header', 'rgh-clean-conversation-headers-hide-author');

	// Removes: octocat opened this issue on 1 Jan [·] 1 comments
	const commentCount = select('relative-time', byline)!.nextSibling!;
	commentCount.replaceWith(<span>{commentCount.textContent!.replace('·', '')}</span>);
}

async function initPR(): Promise<void> {
	const author = await elementReady('.gh-header-meta .flex-auto:not(.rgh-clean-conversation-header) .author');
	if (!author) {
		return;
	}

	const byline = author.closest('.flex-auto')!;

	byline.classList.add('rgh-clean-conversation-header');

	const isSameAuthor = pageDetect.isPRConversation() && author.textContent === (await elementReady('.TimelineItem .author'))!.textContent;

	const base = select('.commit-ref', byline)!;
	const baseBranch = base.title.split(':')[1];

	base.nextElementSibling!.replaceChildren(<ArrowLeftIcon className="v-align-middle mx-1"/>);

	if (isSameAuthor) {
		byline.classList.add('rgh-clean-conversation-headers-hide-author')
	}

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
