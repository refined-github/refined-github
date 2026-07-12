import cx from 'clsx';
import * as pageDetect from 'github-url-detection';
import LockIcon from 'octicons-plain-react/Lock';
import React from 'dom-chef';
import {closestElementOptional} from 'select-dom';

import features from '../feature-manager.js';
import isConversationLocked from '../github-helpers/is-conversation-locked.js';
import {getIdentifiers} from '../helpers/feature-helpers.js';
import observe from '../helpers/selector-observer.js';
import {featureClass as jumpToCloseEventClass} from './jump-to-conversation-close-event.js';

export const {class: featureClass, selector: featureSelector} = getIdentifiers(import.meta.url);

function LockedIndicator(): JSX.Element {
	return (
		<span title="Locked" className={cx('State d-flex flex-items-center flex-shrink-0', featureClass)}>
			<LockIcon className="flex-items-center mr-1 tmp-mr-1" />
			Locked
		</span>
	);
}

function addLockLegacy(element: HTMLElement): void {
	const closestSticky = closestElementOptional(['.sticky-content', '.gh-header-sticky'], element);
	element.after(
		<LockedIndicator className={cx('mb-2 tmp-mb-2', closestSticky && 'mr-2 tmp-mr-2')} />,
	);
}

function addLock(stateLabel: HTMLElement): void {
	const isWrapped = stateLabel.parentElement!.classList.contains(jumpToCloseEventClass);
	const container = isWrapped ? stateLabel.parentElement! : stateLabel;

	container.parentElement!.style.height = 'auto';
	container.parentElement!.classList.add('d-flex', 'gap-2');
	container.after(<LockedIndicator />);
}

async function init(signal: AbortSignal): Promise<void | false> {
	observe(
		'div:is([data-testid^="issue-metadata"], [class^="prc-PageLayout-Header"]) span[class^="prc-StateLabel"]',
		addLock,
		{signal},
	);
	// Old PR view
	// TODO [2026-08-01]: Drop
	observe(
		[
			'.gh-header-meta > :first-child',
			':is(.sticky-content, .gh-header-sticky) .flex-row > :first-child',
		],
		addLockLegacy,
		{signal},
	);
}

void features.add(import.meta.url, {
	asLongAs: [
		pageDetect.isConversation,
		async () => await isConversationLocked() ?? false,
	],
	init,
});

/*

## Test URLs

- Locked issue: https://github.com/refined-github/sandbox/issues/74
- Locked PR: https://github.com/refined-github/sandbox/pull/48

*/
