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

	const {childNodes: bylineNodes} = byline;
	// Removes: octocat opened this issue on 1 Jan [·] 1 comments
	bylineNodes[4].textContent = bylineNodes[4].textContent!.replace('·', '');

	// Removes: [octocat opened this issue on 1 Jan] · 1 comments
	for (const node of [...bylineNodes].slice(0, 4)) {
		node.remove();
	}
}

async function initPR(): Promise<void> {
	const byline = await elementReady('.gh-header-meta .flex-auto:not(.rgh-clean-conversation-header)');
	if (!byline) {
		return;
	}

	byline.classList.add('rgh-clean-conversation-header');

	const author = select('.author', byline)!;
	const isSameAuthor = pageDetect.isPRConversation() && author.textContent === select('.TimelineItem .author')!.textContent;

	const base = select('.commit-ref', byline)!;
	const baseBranch = base.title.split(':')[1];
	const isDefaultBranch = baseBranch === await getDefaultBranch() || (pageDetect.isClosedPR() && baseBranch === 'master');

	byline.childNodes[pageDetect.isClosedPR() ? (pageDetect.isMergedPR() ? 5 : 7) : 9].replaceWith(<> <ArrowLeftIcon/> </>);

	// Removes: [octocat wants to merge 1 commit into] github:master from octocat:feature
	// Removes: [octocat merged 1 commit into] master from feature
	for (const node of [...byline.childNodes].slice(isSameAuthor ? 0 : 2, pageDetect.isMergedPR() ? 3 : 5)) {
		node.remove();
	}

	if (!isSameAuthor) {
		author.before('by ');
		author.after(' • ');
	}

	if (!isDefaultBranch) {
		base.classList.add('rgh-clean-conversation-headers-non-default-branch');
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.isIssue
	],
	additionalListeners: [
		onConversationHeaderUpdate
	],
	awaitDomReady: false,
	init: initIssue
}, {
	include: [
		pageDetect.isPR
	],
	additionalListeners: [
		onConversationHeaderUpdate
	],
	awaitDomReady: false,
	init: initPR
});
