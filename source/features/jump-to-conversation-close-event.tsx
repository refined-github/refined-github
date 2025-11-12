import React from 'dom-chef';
import {lastElement} from 'select-dom';
import * as pageDetect from 'github-url-detection';

import {wrap} from '../helpers/dom-utils.js';
import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

export const statusBadge = [
	'#partial-discussion-header .State',
	'[class^="StateLabel"]',
] as const;

export function getLastCloseEvent(): HTMLElement | undefined {
	return lastElement([
		// TODO: Move to selectors.ts
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
		'.TimelineItem', // Old view
		'[data-timeline-event-id]',
	])?.querySelector('relative-time') ?? undefined;
}

function addToConversation(discussionHeader: HTMLElement): void {
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
		statusBadge,
		addToConversation,
		{signal},
	);
}

void features.add(import.meta.url, {
	asLongAs: [
		pageDetect.isConversation,
		pageDetect.isClosedConversation,
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
