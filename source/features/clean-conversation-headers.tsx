import './clean-conversation-headers.css';
import React from 'dom-chef';
import select from 'select-dom';
import elementReady from 'element-ready';
import {ArrowLeftIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import features from '.';
import getDefaultBranch from '../github-helpers/get-default-branch';
import onConversationHeaderUpdate from '../github-events/on-conversation-header-update';

async function cleanIssueHeader(): Promise<void | false> {
	const byline = await elementReady('.gh-header-meta .flex-auto:not(.rgh-clean-conversation-headers)');
	if (!byline) {
		return false;
	}

	byline.classList.add('rgh-clean-conversation-headers', 'rgh-clean-conversation-headers-hide-author');

	// Shows on issues: octocat opened this issue on 1 Jan · [1 comments]
	// Removes on issues: octocat opened this issue on 1 Jan [·] 1 comments
	const commentCount = select('relative-time', byline)!.nextSibling!;
	commentCount.replaceWith(<span>{commentCount.textContent!.replace('·', '')}</span>);
}

async function cleanPrHeader(): Promise<void | false> {
	const byline = await elementReady('.gh-header-meta .flex-auto:not(.rgh-clean-conversation-headers)');
	if (!byline) {
		return false;
	}

	byline.classList.add('rgh-clean-conversation-headers');

	// Extra author name is only shown on `isPRConversation`
	// Hide if it's the same as the opener (always) or merger
	const shouldHideAuthor = pageDetect.isPRConversation() && select('.author', byline)!.textContent === (await elementReady('.TimelineItem .author'))!.textContent;
	if (shouldHideAuthor) {
		byline.classList.add('rgh-clean-conversation-headers-hide-author');
	}

	const base = select('.commit-ref', byline)!;
	const baseBranchDropdown = select('.commit-ref-dropdown', byline);

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

async function init(): Promise<void | Deinit> {
	const cleanConversationHeader = pageDetect.isIssue() ? cleanIssueHeader : cleanPrHeader;

	// Wait for the initial clean-up to finish before setting up the observer #5573
	if ((await cleanConversationHeader()) !== false) {
		return onConversationHeaderUpdate(cleanConversationHeader);
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isIssue,
		pageDetect.isPR,
	],
	awaitDomReady: false,
	deduplicate: 'has-rgh-inner',
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
