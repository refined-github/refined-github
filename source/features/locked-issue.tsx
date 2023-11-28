import React from 'react';
import {$, $$, elementExists} from 'select-dom';
import {LockIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import {isHasSelectorSupported} from '../helpers/select-has.js';

function LockedIndicator(): JSX.Element {
	return (
		<span title="Locked" className="State d-flex flex-items-center flex-shrink-0">
			<LockIcon className="flex-items-center mr-1"/>
			Locked
		</span>
	);
}

function processTimeline(): void {
	// Gather lock related events and sort by event ID
	const events: HTMLElement[] = $$('.js-discussion .TimelineItem:has(.octicon-key, .octicon-lock)').sort((a, b) => a.id.localeCompare(b.id));
	// If most recent lock change event is locked
	if (elementExists('.octicon-lock', events[0])) {
		$('.gh-header-meta:not(:has(.rgh-locked-issue)) > :first-child')?.after(
			<LockedIndicator className="mb-2 rgh-locked-issue"/>,
		);
		$('.gh-header-sticky:not(:has(.rgh-locked-issue)) .flex-row > :first-child')?.after(
			<LockedIndicator className="mr-2 mb-2 rgh-locked-issue"/>,
		);
	} else { // Remove existing badge otherwise
		$('.gh-header-meta > .rgh-locked-issue')?.remove();
		$('.gh-header-sticky .flex-row > .rgh-locked-issue')?.remove();
	}
}

function init(signal: AbortSignal): void {
	// Observe only non-hidden timeline events
	observe('.js-discussion .js-timeline-item', processTimeline, {signal});
}

void features.add(import.meta.url, {
	asLongAs: [
		isHasSelectorSupported,
	],
	include: [
		pageDetect.isConversation,
	],
	init,
});

/*

## Test URLs

- Locked issue: https://github.com/refined-github/sandbox/issues/74
- Locked PR: https://github.com/refined-github/sandbox/pull/48

*/
