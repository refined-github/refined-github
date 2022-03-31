import './clean-conversation-headers.css';
import React from 'dom-chef';
import select from 'select-dom';
import {ArrowLeftIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import features from '.';
import getDefaultBranch from '../github-helpers/get-default-branch';
import onConversationHeaderUpdate from '../github-events/on-conversation-header-update';

function initIssue(): void {
	const byline = select('.gh-header-meta .flex-auto:not(.rgh-clean-conversation-headers)')!;
	byline.classList.add('rgh-clean-conversation-headers', 'rgh-clean-conversation-headers-hide-author');

	// Shows on issues: octocat opened this issue on 1 Jan · [1 comments]
	// Removes on issues: octocat opened this issue on 1 Jan [·] 1 comments
	const commentCount = select('relative-time', byline)!.nextSibling!;
	commentCount.replaceWith(<span>{commentCount.textContent!.replace('·', '')}</span>);
}

async function initPR(): Promise<void> {
	const byline = select('.gh-header-meta .flex-auto:not(.rgh-clean-conversation-headers)')!;
	byline.classList.add('rgh-clean-conversation-headers');

	// Extra author name is only shown on `isPRConversation`
	// Hide if it's the same as the opener (always) or merger
	const shouldHideAuthor = pageDetect.isPRConversation() && select('.author', byline)!.textContent === select('.TimelineItem .author')!.textContent;
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
	deduplicate: 'has-rgh-inner',
	init: initIssue,
}, {
	include: [
		pageDetect.isPR,
	],
	additionalListeners: [
		onConversationHeaderUpdate,
	],
	deduplicate: 'has-rgh-inner',
	init: initPR,
});

/* Test URLs

- Open PR (default branch): https://github.com/refined-github/sandbox/pull/4
- Open PR (non-default branch): https://github.com/Kenshin/simpread/pull/698

- Merged PR (same author): https://github.com/sindresorhus/refined-github/pull/3402
- Merged PR (different author): https://github.com/parcel-bundler/parcel/pull/78
- Merged PR (different author + first published tag): https://github.com/sindresorhus/refined-github/pull/3227

- Closed PR: https://github.com/sindresorhus/refined-github/pull/4141

*/
