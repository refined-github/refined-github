import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import {BellIcon, BellSlashIcon, IssueReopenedIcon} from '@primer/octicons-react';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

const disableAttrs = {
	'aria-selected': true,
	className: 'selected',
	style: {pointerEvents: 'none'},
} as const satisfies React.HTMLAttributes<HTMLButtonElement>;

function SubButton(): JSX.Element {
	return (
		<button
			data-disable-with
			name="id"
			type="submit"
			className="btn btn-sm flex-grow-1 BtnGroup-item tooltipped tooltipped-sw"
		/>
	);
}

function getCurrentStatus(subscriptionButton: HTMLButtonElement): 'none' | 'all' | 'status' {
	const reason = subscriptionButton
		.closest('.thread-subscription-status')!
		.querySelector('.reason')!
		.textContent!;

	// You’re receiving notifications because you chose custom settings for this thread.
	if (reason.includes('custom settings')) {
		return 'status';
	}

	// You’re not receiving notifications from this thread.
	if (reason.includes('not receiving')) {
		return 'none';
	}

	return 'all';
}

function addButton(subscriptionButton: HTMLButtonElement): void {
	const status = getCurrentStatus(subscriptionButton);
	// Save first
	const originalId = subscriptionButton.form!.elements.id;

	subscriptionButton.after(
		<div className="BtnGroup d-flex width-full">
			<SubButton
				// @ts-expect-error I don't remember how to fix this
				value="unsubscribe"
				aria-label="Unsubscribe"
				{...(status === 'none' && disableAttrs)}
			>
				<BellSlashIcon/> None
			</SubButton>
			<SubButton
				// @ts-expect-error I don't remember how to fix this
				value="subscribe"
				aria-label="Subscribe to all events"
				{...(status === 'all' && disableAttrs)}
			>
				<BellIcon/> All
			</SubButton>

			{/* Always submitted, but ignored unless the value is `subscribe_to_custom_notifications` */}
			<input type="hidden" name="events[]" value="merged"/>
			<input type="hidden" name="events[]" value="closed"/>
			<input type="hidden" name="events[]" value="reopened"/>
			<SubButton
				// @ts-expect-error I don't remember how to fix this
				value="subscribe_to_custom_notifications"
				aria-label="Subscribe just to the close event"
				{...(status === 'status' && disableAttrs)}
			>
				<IssueReopenedIcon/> Status
			</SubButton>
		</div>,
	);

	// Remove it only if the form was successfully added
	originalId.remove();
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
