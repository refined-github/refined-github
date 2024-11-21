import React from 'react';
import LockIcon from 'octicons-plain-react/Lock';
import * as pageDetect from 'github-url-detection';

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
	const classes = (
		element.closest('.gh-header-sticky')
			? 'mr-2 '
			: ''
	)
	+ 'mb-2 rgh-locked-issue';
	element.after(
		<LockedIndicator className={classes} />,
	);
}

async function init(signal: AbortSignal): Promise<void | false> {
	observe([
		'.gh-header-meta > :first-child', // Issue title
		'.gh-header-sticky .flex-row > :first-child', // Sticky issue title
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
