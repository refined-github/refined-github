import './locked-issue-indicator.css';

import React from 'react';
import {LockIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import {$} from 'select-dom';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import {isHasSelectorSupported} from '../helpers/select-has.js';

function LockedIndicator(): JSX.Element {
	return (
		<span title="Locked" className="State d-flex flex-items-center">
			<LockIcon className="flex-items-center mr-1"/>
			Locked
		</span>
	);
}

function addLock(): void {
	// Add locked indicator to header
	$('.gh-header-meta > :first-child')!.after(
		<div className="flex-shrink-0 mb-2 flex-self-start flex-md-self-center rgh-locked-issue-indicator">
			<LockedIndicator/>
		</div>,
	);
	// Add locked indicator to sticky header
	$('.gh-header-sticky .flex-row > :first-child')!.after(
		<div className="mr-2 mb-2 flex-shrink-0 rgh-locked-issue-indicator">
			<LockedIndicator/>
		</div>,
	);
}

function init(signal: AbortSignal): void {
	// If reactions-menu exists, then .js-pick-reaction is the second child
	observe(':has(.js-pick-reaction:first-child) .gh-header-meta', addLock, {signal});
}

void features.add(import.meta.url, {
	asLongAs: [
		isHasSelectorSupported,
	],
	include: [
		pageDetect.isIssue,
		pageDetect.isPR,
	],
	init,
});

/*

## Test URLs

- Locked issue: https://github.com/refined-github/sandbox/issues/74
- Locked PR: https://github.com/refined-github/sandbox/pull/48

*/
