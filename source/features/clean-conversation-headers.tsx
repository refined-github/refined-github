import './clean-conversation-headers.css';

import React from 'dom-chef';
import {$, $optional} from 'select-dom/strict.js';
import elementReady from 'element-ready';
import ArrowLeftIcon from 'octicons-plain-react/ArrowLeft';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import getDefaultBranch from '../github-helpers/get-default-branch.js';
import observe from '../helpers/selector-observer.js';
import {expectToken} from '../github-helpers/github-token.js';
import {parseReferenceRaw} from '../github-helpers/pr-branches.js';
import {assertNodeContent} from '../helpers/dom-utils.js';

async function highlightNonDefaultBranchPRs(base: HTMLElement, baseBranch: string): Promise<void> {
	const wasDefaultBranch = pageDetect.isClosedConversation() && baseBranch === 'master';
	const isDefaultBranch = baseBranch === await getDefaultBranch();
	if (!isDefaultBranch && !wasDefaultBranch) {
		base.classList.add('rgh-non-default-branch');
	}
}

async function cleanPrHeader(byline: HTMLElement): Promise<void> {
	byline.classList.add('rgh-clean-conversation-headers');
	// TODO: Remove after July 2026
	byline.parentElement!.closest('.d-flex')?.classList.add('flex-items-center');

	const prCreatorSelector = [
		'.TimelineItem .author',
		'.Timeline-Item [data-testid="author-avatar"] a:not([data-testid="github-avatar"])',
	];

	// Extra author name is only shown on `isPRConversation`
	// Hide if it's the same as the opener (always) or merger
	const shouldHideAuthor
		= pageDetect.isPRConversation()
			// #7802
			&& !byline.closest([
				'div[class*="stickyHeader"]',
				// TODO: Remove after July 2026
				'.sticky-content',
				'.gh-header-sticky',
			])
			&& $([
				'.author',
				'a[data-hovercard-url]',
			], byline).textContent === (await elementReady(prCreatorSelector))!.textContent;

	if (shouldHideAuthor) {
		byline.classList.add('rgh-hide-author');
	}

	const base = $([
		'[class^="PullRequestBranchName"]',
		// Old views - TODO: Remove after July 2026
		'.commit-ref',
		'[class^="BranchName"]',
	], byline);

	let baseBranch;
	if (base.title) {
		baseBranch = parseReferenceRaw(base.title, base.textContent).branch;
	} else {
		baseBranch = parseReferenceRaw(base.nextElementSibling!.textContent, base.textContent).branch;
	}

	// Don't await https://github.com/refined-github/refined-github/issues/8331
	void highlightNonDefaultBranchPRs(base, baseBranch);

	// Shows on PRs: main [←] feature
	const anchor
		= $optional('.commit-ref-dropdown', byline)?.nextSibling // TODO: remove after July 2026
			?? base.nextSibling!.nextSibling!;
	assertNodeContent(anchor, 'from');

	anchor.after(
		<span className='rgh-arrow'>
			<ArrowLeftIcon className="v-align-middle mx-1" />
		</span>,
	);
}

async function init(signal: AbortSignal): Promise<void> {
	await expectToken();

	observe([
		'span[class*="PullRequestHeaderSummary"]',
		// Old views. TODO: Remove after July 2026
		'.gh-header-meta > .flex-auto', // Real
		'.rgh-conversation-activity-filter', // Helper in case it runs first and breaks the `>` selector, because it wraps the .flex-auto element
		'[class^="StateLabel"] + div > span:first-child',
	], cleanPrHeader, {signal});
}

void features.add(import.meta.url, {
	include: [
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
