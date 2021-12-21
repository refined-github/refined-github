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

	byline.classList.add('rgh-clean-conversation-header');

	// Removes: [octocat opened this issue on 1 Jan] · 1 comments
	for (let i = 0; i < 4; i++) {
		byline.firstChild!.remove();
	}

	// Removes: octocat opened this issue on 1 Jan [·] 1 comments
	byline.firstChild!.textContent = byline.firstChild!.textContent!.replace('·', '');
}

async function initPR(): Promise<void> {
	const author = await elementReady('.gh-header-meta .flex-auto:not(.rgh-clean-conversation-header) .author');
	if (!author) {
		return;
	}

	const byline = author.closest('.flex-auto')!;

	byline.classList.add('rgh-clean-conversation-header');

	const isSameAuthor = pageDetect.isPRConversation() && author.textContent === (await elementReady('.TimelineItem .author'))!.textContent;

	const [base, headBranch] = select.all('.commit-ref', byline);
	const baseBranch = base.title.split(':')[1];

	// Replace the word "from" with an arrow
	headBranch.previousSibling!.replaceWith(' ', <ArrowLeftIcon className="v-align-middle"/>, ' ');

	// Removes: [octocat wants to merge 1 commit into] github:master from octocat:feature
	// Removes: [octocat merged 1 commit into] master from feature
	const duplicateNodes = [...byline.childNodes].slice(
		isSameAuthor ? 0 : 2,
		pageDetect.isMergedPR() ? 3 : 5,
	);
	for (const node of duplicateNodes) {
		node.remove();
	}

	if (!isSameAuthor) {
		author.before('by ');
		author.after(' • ');
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
