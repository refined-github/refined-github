import './status-subscription.css';

import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import BellIcon from 'octicons-plain-react/Bell';
import BellSlashIcon from 'octicons-plain-react/BellSlash';
import IssueReopenedIcon from 'octicons-plain-react/IssueReopened';
import {$, $optional, closestElement} from 'select-dom';

import features from '../feature-manager.js';
import {getConversationNumber, getRepo, multilineAriaLabel} from '../github-helpers/index.js';
import observe from '../helpers/selector-observer.js';
import {tooltipped} from '../helpers/tooltip.js';

type SubscriptionStatus = 'none' | 'all' | 'status';

// Make the element look selected, not disabled, but effectively disable clicks/focus
const disableAttributes = {
	'aria-selected': true,
	className: 'selected',
	tabIndex: -1,
	style: {pointerEvents: 'none'},
} as const satisfies React.ButtonHTMLAttributes<HTMLButtonElement>;

function Button(_props: React.ButtonHTMLAttributes<HTMLButtonElement>): JSX.Element {
	return (
		<button
			data-disable-with
			name="id"
			type="submit"
			className="btn btn-sm flex-1 BtnGroup-item"
		/>
	);
}

function getLegacyReason(subscriptionButton: HTMLButtonElement): HTMLParagraphElement {
	return $('p.reason', closestElement('.thread-subscription-status', subscriptionButton));
}

function getLegacyStatus(button: HTMLButtonElement): SubscriptionStatus {
	const reason = getLegacyReason(button).textContent;

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

function addLegacyButton(subscriptionButton: HTMLButtonElement): void {
	const status = getLegacyStatus(subscriptionButton);
	// Save first
	const originalId = subscriptionButton.form!.elements.id;

	subscriptionButton.after(
		<div className="rgh-status-subscription BtnGroup d-flex width-full">
			{tooltipped(
				{label: 'Unsubscribe', direction: 'sw'},
				<Button value="unsubscribe" {...(status === 'none' && disableAttributes)}>
					<BellSlashIcon /> None
				</Button>,
			)}
			{tooltipped(
				{label: 'Subscribe to all events', direction: 'sw'},
				<Button value="subscribe" {...(status === 'all' && disableAttributes)}>
					<BellIcon /> All
				</Button>,
			)}
			{tooltipped(
				{label: multilineAriaLabel('Subscribe just to status changes', '(closing, reopening, merging)'), direction: 'sw'},
				<Button value="subscribe_to_custom_notifications" {...(status === 'status' && disableAttributes)}>
					<IssueReopenedIcon /> Status
				</Button>,
			)}
		</div>,
		// Always submitted, but ignored unless the value is `subscribe_to_custom_notifications`
		// Keep outside BtnGroup
		<input type="hidden" name="events[]" value="merged" />,
		<input type="hidden" name="events[]" value="closed" />,
		<input type="hidden" name="events[]" value="reopened" />,
	);

	// Remove it only if the form was successfully added
	originalId.remove();
	subscriptionButton.hidden = true;

	// 'all' can have many reasons, but the other two don't add further information #6684
	if (status !== 'all') {
		getLegacyReason(subscriptionButton).hidden = true;
	}
}

const githubApiBaseHeaders = new Headers({
	accept: 'application/json',
	'github-verified-fetch': 'true',
	'x-github-client-version':
		'Refined GitHub. Please address https://github.com/orgs/community/discussions/132506#discussioncomment-11294985',
	credentials: 'include',
});

async function fetchIssueData(): Promise<Record<string, any>> {
	const {owner, name} = getRepo()!;
	const body = {
		// `IssueViewerSecondaryViewQuery`
		query: 'cb9b35846fadf5f80ec3a2c05bf42a89',
		variables: {number: getConversationNumber()!, owner, repo: name},
	};
	const url = new URL('/_graphql', location.origin);
	url.searchParams.set('body', JSON.stringify(body));

	const response = await fetch(url, {headers: githubApiBaseHeaders});
	if (!response.ok) {
		throw new Error('Failed to fetch the issue');
	}

	const {data} = await response.json();
	return data;
}

async function updateSubscription(targetStatus: SubscriptionStatus, id: string): Promise<void> {
	const response = await fetch('/_graphql', {
		headers: githubApiBaseHeaders,
		method: 'POST',
		body: JSON.stringify({
			// `updateIssueSubscriptionMutation`
			query: 'd0752b2e49295017f67c84f21bfe41a3',
			variables: {
				input: {
					events: targetStatus === 'status' ? ['CLOSED', 'REOPENED'] : [],
					state: targetStatus === 'status' ? 'CUSTOM' : targetStatus === 'all' ? 'SUBSCRIBED' : 'UNSUBSCRIBED',
					subscribableId: id,
				},
			},
		}),
	});
	if (!response.ok) {
		throw new Error('Failed to update the issue subscription status');
	}
}

async function addButton(subscriptionButton: HTMLButtonElement): Promise<void> {
	const previousRghButton = $optional('.rgh-status-subscription', subscriptionButton.parentElement!);
	const issue = await fetchIssueData();
	const {id, viewerThreadSubscriptionFormAction, viewerCustomSubscriptionEvents} = issue.repository.issue;
	const isSubscribed = viewerThreadSubscriptionFormAction === 'UNSUBSCRIBE';
	const status: SubscriptionStatus = isSubscribed
		? (viewerCustomSubscriptionEvents.length > 0 ? 'status' : 'all')
		: 'none';

	const getOnClick = (target: SubscriptionStatus) => async (event: React.MouseEvent) => {
		closestElement('fieldset', event.currentTarget).disabled = true;
		await updateSubscription(target, id);
		void addButton(subscriptionButton);
	};

	subscriptionButton.after(
		// Use `fieldset` so that it can be disabled
		<fieldset className="rgh-status-subscription BtnGroup d-flex width-full">
			{tooltipped(
				{label: 'Unsubscribe', direction: 'sw'},
				<Button onClick={getOnClick('none')} {...(status === 'none' && disableAttributes)}>
					<BellSlashIcon /> None
				</Button>,
			)}
			{tooltipped(
				{label: 'Subscribe to all events', direction: 'sw'},
				<Button onClick={getOnClick('all')} {...(status === 'all' && disableAttributes)}>
					<BellIcon /> All
				</Button>,
			)}
			{tooltipped(
				{label: multilineAriaLabel('Subscribe just to status changes', '(closing, reopening, merging)'), direction: 'sw'},
				<Button onClick={getOnClick('status')} {...(status === 'status' && disableAttributes)}>
					<IssueReopenedIcon /> Status
				</Button>,
			)}
		</fieldset>,
	);

	// Would be missing on the first run
	previousRghButton?.remove();
	subscriptionButton.hidden = true;
}

function init(signal: AbortSignal): void {
	// Repos you're ignoring can't be subscribed to, so the button is disabled
	observe('button[data-thread-subscribe-button]:enabled', addLegacyButton, {signal});
	if (!pageDetect.isEnterprise()) {
		observe('button[aria-describedby*="issue-viewer-subscription-description"]', addButton, {signal});
	}
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
- Also test a repo you're completely ignoring

*/
