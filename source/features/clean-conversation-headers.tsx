import './clean-conversation-headers.css';

import React from 'dom-chef';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import ArrowLeftIcon from 'octicons-plain-react/ArrowLeft';
import {$, closestElementOptional} from 'select-dom';

import features from '../feature-manager.js';
import getDefaultBranch from '../github-helpers/get-default-branch.js';
import {parseReferenceRaw} from '../github-helpers/pr-branches.js';
import {assertNodeContent, wrap} from '../helpers/dom-utils.js';
import observe from '../helpers/selector-observer.js';

async function highlightNonDefaultBranchPrs(base: HTMLElement, baseBranch: string): Promise<void> {
	const wasDefaultBranch = pageDetect.isClosedConversation() && baseBranch === 'master';
	const isDefaultBranch = baseBranch === await getDefaultBranch();
	if (!isDefaultBranch && !wasDefaultBranch) {
		base.classList.add('rgh-non-default-branch');
	}
}

async function removeBaseRepo(base: HTMLElement): Promise<void> {
	const textNode = base.firstChild;
	if (!(textNode instanceof Text)) {
		throw new TypeError('Expected a text node');
	}

	const crossRepoPr = textNode.textContent.indexOf(':');
	if (crossRepoPr > 0) {
		textNode.splitText(crossRepoPr + 1);
		wrap(textNode, <span className="sr-only" />);
	}
}

function isStickyHeader(childElement: HTMLElement): boolean {
	return Boolean(closestElementOptional('div[class*="stickyHeader"]', childElement));
}

/** The PR header username is the creator or the merger */
function getHeaderUsername(summaryRow: HTMLElement): HTMLAnchorElement {
	return $('a', summaryRow);
}

const prCreatorSelector = [
	'.TimelineItem .author',
	'.Timeline-Item [data-testid="author-avatar"] a:not([data-testid="github-avatar"])',
] as const;
async function getPrCreator(): Promise<string> {
	return (await elementReady(prCreatorSelector))!.textContent;
}

// Hide if it's the same as the opener (always) or merger
async function maybeHideAuthor(summaryRow: HTMLElement): Promise<void> {
	// Extra author name is only shown on `isPRConversation`
	if (!pageDetect.isPRConversation()) {
		return;
	}

	// Keep author in sticky header
	// https://github.com/refined-github/refined-github/issues/7802
	if (isStickyHeader(summaryRow)) {
		return;
	}

	if (getHeaderUsername(summaryRow).textContent === await getPrCreator()) {
		summaryRow.classList.add('rgh-hide-author');
	}
}

async function hideAuthorMetadata(summaryRow: HTMLElement): Promise<void> {
	for (const child of summaryRow.childNodes) {
		if (child instanceof Text && /^(?:wants to merge|merged) \d+ commit/.test(child.textContent)) {
			child.remove();
			return;
		}
	}

	throw new Error('Unable to find the PR metadata text node');
}

function replaceFromWithArrow(base: HTMLElement): void {
	const anchor = base.nextElementSibling!.nextElementSibling as HTMLElement;
	assertNodeContent(anchor, 'from');
	// Don't remove element, GitHub requires it to change the base
	// https://github.com/refined-github/refined-github/issues/9688
	anchor.hidden = true;
	anchor.after(
		<ArrowLeftIcon className="v-align-middle mx-1 tmp-mx-1 rgh-arrow" />,
	);
}

async function cleanPrHeader(summaryRow: HTMLElement): Promise<void> {
	summaryRow.classList.add('rgh-clean-conversation-headers');

	if (isStickyHeader(summaryRow)) {
		// Add class here to avoid duplicating the selectors into the CSS file
		summaryRow.classList.add('rgh-sticky-pr-header');
	}

	const base = $('[class^="PullRequestBranchName"]', summaryRow);

	// Add class here to avoid duplicating the selectors into the CSS file
	base.classList.add('rgh-base-branch');

	const baseBranch = parseReferenceRaw(
		base.title || base.nextElementSibling!.textContent,
		base.textContent,
	).branch;

	// This can be run asynchronously
	void hideAuthorMetadata(summaryRow);
	void maybeHideAuthor(summaryRow);

	// Don't await https://github.com/refined-github/refined-github/issues/8331
	void highlightNonDefaultBranchPrs(base, baseBranch);
	void removeBaseRepo(base);

	// Shows on PRs: main [←] feature
	replaceFromWithArrow(base);
}

async function init(signal: AbortSignal): Promise<void> {
	observe(
		'.d-flex[class*="PullRequestHeaderSummary"]',
		cleanPrHeader,
		{signal},
	);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPR,
	],
	requiresToken: true,
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
