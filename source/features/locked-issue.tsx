import React from 'react';
import LockIcon from 'octicons-plain-react/Lock';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import isConversationLocked from '../github-helpers/is-conversation-locked.js';
import {getIdentifiers} from '../helpers/feature-helpers.js';

export const {class: featureClass, selector: featureSelector} = getIdentifiers(import.meta.url);

function LockedIndicator(): JSX.Element {
	return (
		<span title="Locked" className="State d-flex flex-items-center flex-shrink-0">
			<LockIcon className="flex-items-center mr-1" />
			Locked
		</span>
	);
}

function addLockLegacy(element: HTMLElement): void {
	const closestSticky = element.closest('.gh-header-sticky');
	const classes = 'mb-2 ' + (closestSticky ? 'mr-2 ' : '');
	element.after(
		<LockedIndicator className={classes + featureClass} />,
	);
}

function addLock(element: HTMLElement): void {
	element.parentElement!.classList.add('d-flex', 'gap-2');
	element.after(
		<LockedIndicator className={element.className + ` ${featureClass}`} />,
	);
}

async function init(signal: AbortSignal): Promise<void | false> {
	// Old views - TODO: Drop after July 2026
	observe(`:is(.gh-header-sticky, .gh-header-meta) .State:not(${featureSelector})`, addLockLegacy, {signal});
	observe(
		`:is([data-testid^="issue-metadata"], [class^="prc-PageLayout-Header"]) [class^="prc-StateLabel-StateLabel"]:not(${featureSelector})`,
		addLock,
		{signal},
	);
}

void features.add(import.meta.url, {
	asLongAs: [
		async () => await isConversationLocked() === true,
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
