import React from 'dom-chef';
import {$, $$} from 'select-dom/strict.js';
import * as pageDetect from 'github-url-detection';
import debounce from 'debounce-fn';

import {wrap} from '../helpers/dom-utils.js';
import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import {conversationCloseEvent} from '../github-helpers/selectors.js';
import { getFeatureID } from '../helpers/feature-helpers.js';

export const statusBadge = [
	'#partial-discussion-header .State:not(.rgh-locked-issue)',
	'[data-testid="header-state"]',
] as const;

const featureId = getFeatureID(import.meta.url);

function addToConversation(closeEvent: HTMLAnchorElement): void {
	const statusBadges = $$(statusBadge);
	const eventAnchor = $('a[href*="#event-"]', closeEvent)

	for (const statusBadge of statusBadges) {
		if (!statusBadge.classList.contains(featureId)) {
			statusBadge.classList.add(featureId);
			// Avoid native `title` by disabling pointer events, we have our own `aria-label`. We can't drop the `title` attribute because some features depend on it.
			statusBadge.style.pointerEvents = 'none';

			wrap(
				statusBadge,
				<a
					aria-label="Scroll to most recent close event"
					className="tooltipped tooltipped-e"
					href={eventAnchor.href}
				/>,
			);
		} else {
			$('a', statusBadge).href = eventAnchor.href;
		}
	}
}

function init(signal: AbortSignal): void {
	observe(
		conversationCloseEvent,
		debounce(addToConversation, {wait: 100}),
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
