import './locked-issue.css';
import React from 'react';
import LockIcon from '@primer/octicons-react/build/svg/LockIcon-16.svg';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import {isHasSelectorSupported} from '../helpers/select-has.js';
import {lockedIssueHeaders} from '../github-helpers/selectors.js';

function LockedIndicator(): JSX.Element {
	return (
		<span title="Locked" className="State d-flex flex-items-center flex-shrink-0">
			<LockIcon className="flex-items-center mr-1"/>
			Locked
		</span>
	);
}

function addLock(element: HTMLElement): void {
	element.after(
		<LockedIndicator className="mb-2 rgh-locked-issue"/>,
	);
}

function init(signal: AbortSignal): void {
	observe(lockedIssueHeaders, addLock, {signal});
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
