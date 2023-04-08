import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import {BellIcon, BellSlashIcon, IssueReopenedIcon} from '@primer/octicons-react';

import features from '../feature-manager';
import observe from '../helpers/selector-observer';

function addButton(subscriptionButton: HTMLButtonElement): void {
	subscriptionButton.before(
		<div className="BtnGroup d-flex width-full">
			<button
				type="button"
				className="btn btn-sm flex-grow-1 BtnGroup-item tooltipped tooltipped-s"
				aria-label="Unsubscribe"
			>
				<BellSlashIcon/> None
			</button>
			<button
				aria-selected
				type="button"
				className="btn btn-sm flex-grow-1 BtnGroup-item tooltipped tooltipped-s selected"
				aria-label="Subscribe"
			>
				<BellIcon/> All
			</button>
			<button
				type="button"
				className="btn btn-sm flex-grow-1 BtnGroup-item tooltipped tooltipped-s"
				aria-label="Subscribe just to close event"
			>
				<IssueReopenedIcon/> Status
			</button>
		</div>,
	);
	subscriptionButton.hidden = true;
}

function init(signal: AbortSignal): void | false {
	observe('button[data-thread-subscribe-button]', addButton, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isConversation,
	],
	awaitDomReady: true, // The sidebar is at the end of the page
	init,
});

/*

Test URLs

- Issue: https://github.com/refined-github/sandbox/issues/3
- PR: https://github.com/refined-github/sandbox/pull/4

*/
