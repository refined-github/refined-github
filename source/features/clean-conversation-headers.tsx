import './clean-conversation-headers.css';
import React from 'dom-chef';
import {$} from 'select-dom';
import elementReady from 'element-ready';
import {ArrowLeftIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import getDefaultBranch from '../github-helpers/get-default-branch.js';
import observe from '../helpers/selector-observer.js';

async function cleanIssueHeader(byline: HTMLElement): Promise<void> {
	byline.classList.add('rgh-clean-conversation-headers', 'rgh-clean-conversation-headers-hide-author');

	// Shows on issues: octocat opened this issue on 1 Jan · [1 comments]
	// Removes on issues: octocat opened this issue on 1 Jan [·] 1 comments
	const commentCount = $('relative-time', byline)!.nextSibling!;
	commentCount.replaceWith(<span>{commentCount.textContent.replace('·', '')}</span>);
}

async function cleanPrHeader(byline: HTMLElement): Promise<void> {
	byline.classList.add('rgh-clean-conversation-headers');

	// Extra author name is only shown on `isPRConversation`
	// Hide if it's the same as the opener (always) or merger
	const shouldHideAuthor = pageDetect.isPRConversation() && $('.author', byline)!.textContent === (await elementReady('.TimelineItem .author'))!.textContent;
	if (shouldHideAuthor) {
		byline.classList.add('rgh-clean-conversation-headers-hide-author');
	}

	const base = $('.commit-ref', byline)!;
	const baseBranchDropdown = $('.commit-ref-dropdown', byline);

	// Shows on PRs: main [←] feature
	const arrowIcon = <ArrowLeftIcon className="v-align-middle mx-1"/>;
	if (baseBranchDropdown) {
		baseBranchDropdown.after(<span>{arrowIcon}</span>); // #5598
	} else {
		base.nextElementSibling!.replaceChildren(arrowIcon);
	}

	const baseBranch = base.title.split(':')[1];
	const wasDefaultBranch = pageDetect.isClosedPR() && baseBranch === 'master';
	const isDefaultBranch = baseBranch === await getDefaultBranch();
	if (!isDefaultBranch && !wasDefaultBranch) {
		base.classList.add('rgh-clean-conversation-headers-non-default-branch');
	}
}

async function init(signal: AbortSignal): Promise<void> {
	const cleanConversationHeader = pageDetect.isIssue() ? cleanIssueHeader : cleanPrHeader;
	observe('.gh-header-meta .flex-auto', cleanConversationHeader, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isIssue,
		pageDetect.isPR,
	],
	init,
});

/* Test URLs

- Open PR (default branch): https://github.com/refined-github/sandbox/pull/4
- Open PR (non-default branch): https://github.com/Kenshin/simpread/pull/698

- Merged PR (same author): https://github.com/sindresorhus/refined-github/pull/3402
- Merged PR (different author): https://github.com/parcel-bundler/parcel/pull/78
- Merged PR (different author + first published tag): https://github.com/sindresorhus/refined-github/pull/3227

- Closed PR: https://github.com/sindresorhus/refined-github/pull/4141

*/
