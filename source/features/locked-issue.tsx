import React from 'react';
import LockIcon from 'octicons-plain-react/Lock';
import * as pageDetect from 'github-url-detection';
import elementReady from 'element-ready';

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

async function init(signal: AbortSignal): Promise<void | false> {
	// If reactions-menu exists, then .js-pick-reaction is the second child
	const reactions = await elementReady('.js-pick-reaction');
	if (!reactions?.matches(':first-child')) {
		return false;
	}

	observe([
		'.gh-header-meta > :first-child', // Issue title
		'.gh-header-sticky .flex-row > :first-child', // Sticky issue title
	], addLock, {signal});
}

void features.add(import.meta.url, {
	asLongAs: [
		// Logged out users never see the reactions menu used to determine lock status. This would lead to false positives.
		pageDetect.isLoggedIn,
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
