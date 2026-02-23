import React from 'react';
import LockIcon from 'octicons-plain-react/Lock';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import isConversationLocked from '../github-helpers/is-conversation-locked.js';
import {getIdentifiers} from '../helpers/feature-helpers.js';
import {featureSelector as jumpToCloseEventSelector} from './jump-to-conversation-close-event.js';

export const {class: featureClass, selector: featureSelector} = getIdentifiers(import.meta.url);

function LockedIndicator(): JSX.Element {
	return (
		<span title="Locked" className={`State d-flex flex-items-center flex-shrink-0 ${featureClass}`}>
			<LockIcon className="flex-items-center mr-1" />
			Locked
		</span>
	);
}

function addLockLegacy(element: HTMLElement): void {
	const closestSticky = element.closest(['.sticky-content', '.gh-header-sticky']);
	element.after(
		<LockedIndicator className={`mb-2 ${closestSticky ? 'mr-2 ' : ''}`} />,
	);
}

function addLock(stateLabel: HTMLElement): void {
	const isWrapped = Boolean(stateLabel.closest(jumpToCloseEventSelector));
	const container = isWrapped ? stateLabel.parentElement! : stateLabel;

	container.parentElement!.classList.add('d-flex', 'gap-2');
	container.after(<LockedIndicator />);
}

async function init(signal: AbortSignal): Promise<void | false> {
	observe([
		'div:is([data-testid^="issue-metadata"], [class^="prc-PageLayout-Header"])',
		' ',
		`span[class^="prc-StateLabel-StateLabel"]:not(${featureSelector})`,
	].join(''), addLock, {signal});
	// Old PR view - TODO: Drop after July 2026
	observe([
		'.gh-header-meta > :first-child',
		':is(.sticky-content, .gh-header-sticky) .flex-row > :first-child',
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
