/**
@description Show a label on locked issues and PRs.
@screenshot https://user-images.githubusercontent.com/1402241/283015579-0a04becc-9bff-4aef-8770-272d6804970b.png
*/

import cx from 'clsx';
import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import LockIcon from 'octicons-plain-react/Lock';

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
