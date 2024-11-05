import React from 'dom-chef';
import {css} from 'code-tag';
import {lastElement} from 'select-dom';
import {$} from 'select-dom/strict.js';
import * as pageDetect from 'github-url-detection';

import {wrap} from '../helpers/dom-utils.js';
import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

export const closedOrMergedMarkerSelector = css`
	#partial-discussion-header :is(
		[title^="Status: Closed"],
		[title^="Status: Merged"]
	),
	[data-testid="issue-viewer-container"] [data-testid="header-state"]
`;

export function isClosedOrMerged(discussionHeader = $(closedOrMergedMarkerSelector)): boolean {
	return /^Closed|^Merged/.test(discussionHeader.textContent);
}

export function getLastCloseEvent(): HTMLElement | undefined {
	return lastElement([
		// Old view: Drop in April 2025
		`.TimelineItem-badge :is(
			.octicon-issue-closed,
			.octicon-git-merge,
			.octicon-git-pull-request-closed,
			.octicon-skip
		)`,
		// React view (values for PR states not yet known)
		`[data-testid="state-reason-link"]:is(
			[href*="reason%3Acompleted"],
			[href*="reason%3Anot-planned"]
		)`,
	])?.closest([
		'.TimelineItem', // Old version
		'.Timeline-Item',
	])?.querySelector('relative-time') ?? undefined;
}

function addToConversation(discussionHeader: HTMLElement): void {
	if (!isClosedOrMerged(discussionHeader)) {
		return;
	}

	// Avoid native `title` by disabling pointer events, we have our own `aria-label`. We can't drop the `title` attribute because some features depend on it.
	discussionHeader.style.pointerEvents = 'none';

	wrap(
		discussionHeader,
		<a
			aria-label="Scroll to most recent close event"
			className="tooltipped tooltipped-e"
			href={getLastCloseEvent()!.closest('a')!.href}
		/>,
	);
}

function init(signal: AbortSignal): void {
	observe(
		closedOrMergedMarkerSelector,
		addToConversation,
		{signal},
	);
}

void features.add(import.meta.url, {
	asLongAs: [
		pageDetect.isConversation,
	],
	include: [
		pageDetect.isClosedIssue,
		pageDetect.isClosedPR,
	],
	awaitDomReady: true, // We're specifically looking for the last event
	init,
});

/*
## Test URLs
Closed Issue: https://github.com/refined-github/sandbox/issues/2
Closed Issue (Not Planned): https://github.com/refined-github/sandbox/issues/24
Merged PR: https://github.com/refined-github/sandbox/pull/23
Closed PR: https://github.com/refined-github/sandbox/pull/22
*/
