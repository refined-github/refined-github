import React from 'dom-chef';
import {lastElement} from 'select-dom';
import {$$} from 'select-dom/strict.js';
import * as pageDetect from 'github-url-detection';

import {wrap} from '../helpers/dom-utils.js';
import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import {loadedConversationTimeline} from '../github-helpers/selectors.js';

export const statusBadge = [
	'#partial-discussion-header .State:not(.rgh-locked-issue)',
	'[data-testid="header-state"]',
] as const;

export function getLastCloseEvent(): HTMLElement | undefined {
	return lastElement([
		// TODO: Move to selectors.ts
		// Old view
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

function addToConversation(): void {
	const statusBadges = $$(statusBadge);
	for (const statusBadge of statusBadges) {
		// Avoid native `title` by disabling pointer events, we have our own `aria-label`. We can't drop the `title` attribute because some features depend on it.
		statusBadge.style.pointerEvents = 'none';

		wrap(
			statusBadge,
			<a
				aria-label="Scroll to most recent close event"
				className="tooltipped tooltipped-e"
				href={getLastCloseEvent()!.closest('a')!.href}
			/>,
		);
	}
}

function init(signal: AbortSignal): void {
	observe(
		loadedConversationTimeline,
		addToConversation,
		{signal},
	);
}

void features.add(import.meta.url, {
	asLongAs: [
		pageDetect.isConversation,
		pageDetect.isClosedConversation,
	],
	init,
});

/*
## Test URLs
Closed Issue: https://github.com/refined-github/sandbox/issues/2
Closed Issue (Not Planned): https://github.com/refined-github/sandbox/issues/24
Merged PR: https://github.com/refined-github/sandbox/pull/23
Closed PR: https://github.com/refined-github/sandbox/pull/22
*/
