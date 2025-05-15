import React from 'react';
import LockIcon from 'octicons-plain-react/Lock';
import * as pageDetect from 'github-url-detection';
import {elementExists} from 'select-dom';
import {$} from 'select-dom/strict.js';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import isConversationLocked from '../github-helpers/is-conversation-locked.js';

function LockedIndicator(): JSX.Element {
	return (
		<span title="Locked" className="State d-flex flex-items-center flex-shrink-0">
			<LockIcon className="flex-items-center mr-1" />
			Locked
		</span>
	);
}

function addLock(element: HTMLElement): void {
	const isReactView = element.getAttribute('data-testid')?.startsWith('issue-metadata');

	// Avoid adding it duplicately in issue
	if (isReactView && elementExists('.rgh-locked-issue', element)) {
		return;
	}

	const closestSticky = element.closest('.gh-header-sticky');
	const classes = `${closestSticky ? 'mr-2 ' : ''}${isReactView ? '' : 'mb-2 '}`;

	const container = isReactView ? $('[data-testid="header-state"]', element).parentElement! : element;
	container!.after(
		<LockedIndicator className={classes + 'rgh-locked-issue'} />,
	);
}

async function init(signal: AbortSignal): Promise<void | false> {
	observe([
		'[data-testid="issue-metadata-fixed"]', // Issue title
		'[data-testid="issue-metadata-sticky"]', // Sticky issue title
		'.gh-header-meta > :first-child', // PR title
		'.gh-header-sticky .flex-row > :first-child', // Sticky PR title
	], addLock, {signal});
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
