import React from 'react';
import LockIcon from 'octicons-plain-react/Lock';
import * as pageDetect from 'github-url-detection';
import {isChrome} from 'webext-detect-page';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

function LockedIndicator(): JSX.Element {
	return (
		<span title="Locked" className="State d-flex flex-items-center flex-shrink-0">
			<LockIcon className="flex-items-center mr-1"/>
			Locked
		</span>
	);
}

function addLock(element: HTMLElement): void {
	const classes = (element.closest('.gh-header-sticky') ? 'mr-2 ' : '') + 'mb-2 rgh-locked-issue';
	element.after(
		<LockedIndicator className={classes}/>,
	);
}

function init(signal: AbortSignal): void {
	// If reactions-menu exists, then .js-pick-reaction is the second child
	// Logged out users never have the menu, so they should be excluded
	observe(`
		.logged-in .js-issues-results:has(.js-pick-reaction:first-child) :is(
			.gh-header-meta > :first-child,
			.gh-header-sticky .flex-row > :first-child
		)
	`, addLock, {signal});
}

void features.add(import.meta.url, {
	asLongAs: [
		isChrome,
	],
	include: [
		pageDetect.isConversation,
	],
	exclude: [
		// TODO: Find alternative detection that works even for GHE that don't have reactions enabled
		// https://github.com/refined-github/refined-github/issues/7063
		pageDetect.isEnterprise,
	],
	init,
});

/*

## Test URLs

- Locked issue: https://github.com/refined-github/sandbox/issues/74
- Locked PR: https://github.com/refined-github/sandbox/pull/48

*/
