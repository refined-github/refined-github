import React from 'dom-chef';
import {$, $$, lastElement} from 'select-dom/strict.js';
import * as pageDetect from 'github-url-detection';
import debounce from 'debounce-fn';

import {wrap} from '../helpers/dom-utils.js';
import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import {conversationCloseEvent} from '../github-helpers/selectors.js';
import {getIdentifiers} from '../helpers/feature-helpers.js';
import './jump-to-conversation-close-event.css';

export const statusBadge = [
	'#partial-discussion-header .State:not(.rgh-locked-issue)',
	'[data-testid="header-state"]',
] as const;

const {class: featureClass} = getIdentifiers(import.meta.url);

function updateStatusBadges(): void {
	// Not processing the element that has been observed because past events may load in the middle of the page
	const lastCloseEvent = lastElement(conversationCloseEvent);
	const eventAnchor = $('a[href*="#event-"]', lastCloseEvent);
	const statusBadges = $$(statusBadge);

	for (const statusBadge of statusBadges) {
		const maybeWrapper = statusBadge.parentElement!;
		if (maybeWrapper.classList.contains(featureClass)) {
			(maybeWrapper as HTMLAnchorElement).href = eventAnchor.href;
		} else {
			// Avoid native `title` by disabling pointer events, we have our own `aria-label`. We can't drop the `title` attribute because some features depend on it.
			statusBadge.style.pointerEvents = 'none';
			wrap(
				statusBadge,
				<a
					aria-label="Scroll to most recent close event"
					className={`tooltipped tooltipped-e ${featureClass}`}
					href={eventAnchor.href}
				/>,
			);
		}
	}
}

function init(signal: AbortSignal): void {
	observe(
		conversationCloseEvent,
		// Avoid calling `updateStatusBadges` for every close event on initial load
		debounce(updateStatusBadges, {wait: 100}),
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

Test URLs:

- Closed Issue: https://github.com/refined-github/sandbox/issues/2
- Closed Issue (Not Planned): https://github.com/refined-github/sandbox/issues/24
- Merged PR: https://github.com/refined-github/sandbox/pull/23
- Closed PR: https://github.com/refined-github/sandbox/pull/22

*/
