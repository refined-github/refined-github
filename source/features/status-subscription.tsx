import './status-subscription.css';

import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import mem from 'memoize';
import {$} from 'select-dom/strict.js';
import BellIcon from 'octicons-plain-react/Bell';
import BellSlashIcon from 'octicons-plain-react/BellSlash';
import IssueReopenedIcon from 'octicons-plain-react/IssueReopened';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import {getConversationNumber, getRepo, multilineAriaLabel} from '../github-helpers/index.js';

type SubscriptionStatus = 'none' | 'all' | 'status';

// Make the element look selected, not disabled, but effectively disable clicks/focus
const disableAttributes = {
	'aria-selected': true,
	className: 'selected',
	tabIndex: -1,
	style: {pointerEvents: 'none'},
} as const satisfies React.HTMLAttributes<HTMLButtonElement>;

function SubButton(): JSX.Element {
	return (
		<button
			data-disable-with
			name="id"
			type="submit"
			className="btn btn-sm flex-1 BtnGroup-item tooltipped tooltipped-sw"
		/>
	);
}

function getReasonElement(subscriptionButton: HTMLButtonElement): HTMLParagraphElement {
	return subscriptionButton
		.closest('.thread-subscription-status')!
		.querySelector('p.reason')!;
}

function getCurrentStatus(subscriptionButton: HTMLButtonElement): SubscriptionStatus {
	const reason = getReasonElement(subscriptionButton).textContent;

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
		<div className="rgh-status-subscription BtnGroup d-flex width-full">
			<SubButton
				// @ts-expect-error I don't remember how to fix this
				value="unsubscribe"
				aria-label="Unsubscribe"
				{...(status === 'none' && disableAttributes)}
			>
				<BellSlashIcon /> None
			</SubButton>

			<SubButton
				// @ts-expect-error I don't remember how to fix this
				value="subscribe"
				aria-label="Subscribe to all events"
				{...(status === 'all' && disableAttributes)}
			>
				<BellIcon /> All
			</SubButton>

			<SubButton
				// @ts-expect-error I don't remember how to fix this
				value="subscribe_to_custom_notifications"
				aria-label={multilineAriaLabel(
					'Subscribe just to status changes',
					'(closing, reopening, merging)',
				)}
				{...(status === 'status' && disableAttributes)}
			>
				<IssueReopenedIcon /> Status
			</SubButton>
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
		getReasonElement(subscriptionButton).hidden = true;
	}
}

const githubClientVersion = $('meta[name="release"]').content;
const issuesApiBaseHeaders = {
	accept: 'application/json',
	'github-verified-fetch': 'true',
	// Maybe 0749b7b39e97665203056321616a829ef6854483 should be hardcoded
	'x-github-client-version': githubClientVersion,
	credentials: 'include',
};

async function fetchIssueUncached(): Promise<Record<string, any>> {
	const repoInfo = getRepo();
	if (!repoInfo) {
		throw new Error('Can\'t get the repository info');
	}

	const body = {
		query: 'dd170c659a085a45885ee5a168fc52c8',
		variables: {
			number: getConversationNumber(),
			owner: repoInfo.owner,
			repo: repoInfo.name,
		},
	};
	const url = new URL('/_graphql', location.origin);
	url.searchParams.set('body', JSON.stringify(body));

	const response = await fetch(url, {headers: issuesApiBaseHeaders});

	const {data} = await response.json();
	return data;
}

const fetchIssue = mem(fetchIssueUncached, {
	cacheKey: JSON.stringify,
});

async function updateIssueSubscriptionStatus(targetStatus: SubscriptionStatus): Promise<Response> {
	const data = await fetchIssue();
	const {id} = data.repository.issue;

	const body = {
		query: 'd0752b2e49295017f67c84f21bfe41a3',
		variables: {
			input: {
				events: targetStatus === 'status' ? ['CLOSED', 'REOPENED'] : [],
				state: targetStatus === 'status' ? 'CUSTOM' : targetStatus === 'all' ? 'SUBSCRIBED' : 'UNSUBSCRIBED',
				subscribableId: id,
			},
		},
	};

	return fetch('/_graphql',
		{
			headers: issuesApiBaseHeaders,
			method: 'POST',
			body: JSON.stringify(body),
		},
	);
}

async function getCurrentStatusIssue(): Promise<SubscriptionStatus> {
	const data = await fetchIssue();
	const {viewerThreadSubscriptionFormAction, viewerCustomSubscriptionEvents} = data.repository.issue;
	const isSubscribed = viewerThreadSubscriptionFormAction === 'UNSUBSCRIBE';

	if (isSubscribed) {
		if (viewerCustomSubscriptionEvents.length > 0) {
			return 'status';
		}

		return 'all';
	}

	return 'none';
}

async function addButtonIssue(subscriptionButton: HTMLButtonElement): Promise<void> {
	const status = await getCurrentStatusIssue();

	// TODO: Update buttons state after clicking
	subscriptionButton.after(
		<div className="rgh-status-subscription BtnGroup d-flex width-full">
			<SubButton
				aria-label="Unsubscribe"
				onClick={async () => updateIssueSubscriptionStatus('none')}
				{...(status === 'none' && disableAttributes)}
			>
				<BellSlashIcon /> None
			</SubButton>

			<SubButton
				aria-label="Subscribe to all events"
				onClick={async () => updateIssueSubscriptionStatus('all')}
				{...(status === 'all' && disableAttributes)}
			>
				<BellIcon /> All
			</SubButton>

			<SubButton
				aria-label={multilineAriaLabel(
					'Subscribe just to status changes',
					'(closing, reopening, merging)',
				)}
				onClick={async () => updateIssueSubscriptionStatus('status')}
				{...(status === 'status' && disableAttributes)}
			>
				<IssueReopenedIcon /> Status
			</SubButton>
		</div>,
	);

	subscriptionButton.hidden = true;
}

function init(signal: AbortSignal): void {
	// Repos you're ignoring can't be subscribed to, so the button is disabled
	observe('button[data-thread-subscribe-button]:enabled', addButton, {signal});
	observe('button[aria-describedby*="issue-viewer-subscription-description"]', addButtonIssue, {signal});
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
