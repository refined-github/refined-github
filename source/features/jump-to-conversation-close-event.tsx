import React from 'dom-chef';
import {css} from 'code-tag';
import {lastElement} from 'select-dom';
import * as pageDetect from 'github-url-detection';

import {wrap} from '../helpers/dom-utils.js';
import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

export const closedOrMergedMarkerSelector = css`
	#partial-discussion-header :is(
		[title^="Status: Closed"],
		[title^="Status: Merged"]
	)
`;

export function getLastCloseEvent(): HTMLElement | undefined {
	return lastElement(`
		.TimelineItem-badge :is(
			.octicon-issue-closed,
			.octicon-git-merge,
			.octicon-git-pull-request-closed,
			.octicon-skip
		)
	`)!.closest('.TimelineItem') ?? undefined;
}

function addToConversation(discussionHeader: HTMLElement): void {
	// Avoid native `title` by disabling pointer events, we have our own `aria-label`. We can't drop the `title` attribute because some features depend on it.
	discussionHeader.style.pointerEvents = 'none';

	wrap(discussionHeader,
		<a
			aria-label="Scroll to most recent close event"
			className="tooltipped tooltipped-s"
			href={'#' + getLastCloseEvent()!.id}
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
