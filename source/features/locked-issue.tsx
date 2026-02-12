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
	const closestSticky = element.closest('.sticky-content');
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
	observe(
		`:is([data-testid^="issue-metadata"], [class^="prc-PageLayout-Header"]) [class^="prc-StateLabel-StateLabel"]:not(${featureSelector})`,
		addLock,
		{signal},
	);
	// Old PR view - TODO: Drop after July 2026
	observe([
		'.gh-header-meta > :first-child',
		'.sticky-content .flex-row > :first-child'
	], addLockLegacy, {signal});
}

void features.add(import.meta.url, {
	asLongAs: [
		async () => await isConversationLocked() ?? false,
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
