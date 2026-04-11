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
import {assertNodeContent, isSmallDevice} from '../helpers/dom-utils.js';

async function highlightNonDefaultBranchPrs(base: HTMLElement, baseBranch: string): Promise<void> {
	const wasDefaultBranch = pageDetect.isClosedConversation() && baseBranch === 'master';
	const isDefaultBranch = baseBranch === await getDefaultBranch();
	if (!isDefaultBranch && !wasDefaultBranch) {
		base.classList.add('rgh-non-default-branch');
	}
}

async function cleanPrHeader(summaryRow: HTMLElement): Promise<void> {
	summaryRow.classList.add('rgh-clean-conversation-headers');

	const prCreatorSelector = [
		'.TimelineItem .author',
		'.Timeline-Item [data-testid="author-avatar"] a:not([data-testid="github-avatar"])',
	];

	const shouldHideAuthor
	= isSmallDevice()
	|| (pageDetect.isPRConversation()
		// #7802
		&& !summaryRow.closest([
			'div[class*="stickyHeader"]',
			// TODO: Remove after July 2026
			'.sticky-content',
			'.gh-header-sticky',
		])
		// First link in the summary row is always the author
		&& $('a', summaryRow).textContent === (await elementReady(prCreatorSelector))!.textContent);

	if (shouldHideAuthor) {
		summaryRow.classList.add('rgh-hide-author');
	}

	const base = $([
		'[class^="PullRequestBranchName"]',
		// Old views - TODO: Remove after July 2026
		'.commit-ref',
		'[class^="BranchName"]',
	], summaryRow);

	let baseBranch;
	if (base.title) {
		baseBranch = parseReferenceRaw(base.title, base.textContent).branch;
	} else {
		baseBranch = parseReferenceRaw(base.nextElementSibling!.textContent, base.textContent).branch;
	}

	// Don't await https://github.com/refined-github/refined-github/issues/8331
	void highlightNonDefaultBranchPrs(base, baseBranch);

	// Shows on PRs: main [←] feature
	const anchor
		= $optional('.commit-ref-dropdown', summaryRow)?.nextSibling // TODO: remove after July 2026
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
		'.js-issues-results .rgh-conversation-activity-filter', // Helper in case it runs first and breaks the `>` selector, because it wraps the .flex-auto element
		'[class^="StateLabel"] + div > span:first-child',
	], cleanPrHeader, {signal});
}

function reducePrLabelSize(labelIcon: SVGSVGElement): void {
	const label = labelIcon.parentElement!;
	const stickyHeader = label.closest('div[class*="use-sticky-header"]')!;

	const rghLabel = label.cloneNode(true);
	rghLabel.dataset.size = 'small';
	rghLabel.classList.add('mr-2', 'd-inline', 'rgh-sticky-header-label');

	const currentRghLabel = $optional('.rgh-sticky-header-label', stickyHeader);
	if (currentRghLabel) {
		currentRghLabel.replaceWith(rghLabel);
	} else {
		stickyHeader.style.setProperty('padding-block', '2px', 'important');
		const prTitle = $('a[href="#top"]', stickyHeader);
		label.parentElement!.classList.add('sr-only');
		prTitle.before(rghLabel);
	}
}

function reduceIssueLabelSize(label: HTMLElement): void {
	label.dataset.size = 'small';
	const container = label.closest('div[class*="contentContainer"]')!;
	container.classList.add('px-2');
}

function initSmall(signal: AbortSignal): void {
	observe('div[class*="use-sticky-header"] span[class*="StateLabel"] > svg',
		reducePrLabelSize,
		{signal});

	observe('#issue-viewer-sticky-header span[class*="StateLabel"]',
		reduceIssueLabelSize,
		{signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPR,
	],
	init,
}, {
	asLongAs: [
		isSmallDevice,
	],
	include: [
		pageDetect.isConversation,
	],
	init: initSmall,
});

/* Test URLs

- Open PR (default branch): https://github.com/refined-github/sandbox/pull/4
- Open PR (non-default branch): https://github.com/Kenshin/simpread/pull/698

- Merged PR (same author): https://github.com/sindresorhus/refined-github/pull/3402
- Merged PR (different author): https://github.com/parcel-bundler/parcel/pull/78
- Merged PR (different author + first published tag): https://github.com/sindresorhus/refined-github/pull/3227

- Closed PR: https://github.com/sindresorhus/refined-github/pull/4141

- Issue: https://github.com/refined-github/refined-github/issues/9169

*/
