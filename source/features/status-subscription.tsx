import './status-subscription.css';

import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import {$, $optional} from 'select-dom/strict.js';
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

const githubApiBaseHeaders = new Headers({
	accept: 'application/json',
	'github-verified-fetch': 'true',
	'x-github-client-version': $('meta[name="release"]').content,
	credentials: 'include',
});

type IssueApiResponse = Record<string, any>;

async function fetchIssue(): Promise<IssueApiResponse> {
	const repo = getRepo()!;

	const body = {
		query: 'fa182058c0b83a77481f98108cdbf1eb',
		variables: {
			number: getConversationNumber()!,
			owner: repo.owner,
			repo: repo.name,
		},
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

async function updateIssueSubscriptionStatus(targetStatus: SubscriptionStatus, issue: IssueApiResponse): Promise<void> {
	const {id} = issue.repository.issue;

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

	const response = await fetch('/_graphql',
		{
			headers: githubApiBaseHeaders,
			method: 'POST',
			body: JSON.stringify(body),
		},
	);
	if (!response.ok) {
		throw new Error('Failed to update the issue subscription status');
	}
}

async function getCurrentStatusIssue(issue: IssueApiResponse): Promise<SubscriptionStatus> {
	const {viewerThreadSubscriptionFormAction, viewerCustomSubscriptionEvents} = issue.repository.issue;
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
	const issue = await fetchIssue();
	const status = await getCurrentStatusIssue(issue);
	const previousRghButton = $optional('.rgh-status-subscription', subscriptionButton.parentElement!);

	subscriptionButton.after(
		<div className="rgh-status-subscription BtnGroup d-flex width-full">
			<SubButton
				aria-label="Unsubscribe"
				onClick={async () => {
					await updateIssueSubscriptionStatus('none', issue);
					void addButtonIssue(subscriptionButton);
				}}
				{...(status === 'none' && disableAttributes)}
			>
				<BellSlashIcon /> None
			</SubButton>

			<SubButton
				aria-label="Subscribe to all events"
				onClick={async () => {
					await updateIssueSubscriptionStatus('all', issue);
					void addButtonIssue(subscriptionButton);
				}}
				{...(status === 'all' && disableAttributes)}
			>
				<BellIcon /> All
			</SubButton>

			<SubButton
				aria-label={multilineAriaLabel(
					'Subscribe just to status changes',
					'(closing, reopening, merging)',
				)}
				onClick={async () => {
					await updateIssueSubscriptionStatus('status', issue);
					void addButtonIssue(subscriptionButton);
				}}
				{...(status === 'status' && disableAttributes)}
			>
				<IssueReopenedIcon /> Status
			</SubButton>
		</div>,
	);

	previousRghButton?.remove();
	subscriptionButton.hidden = true;
}

function init(signal: AbortSignal): void {
	// Repos you're ignoring can't be subscribed to, so the button is disabled
	observe('button[data-thread-subscribe-button]:enabled', addButton, {signal});
	if (!pageDetect.isEnterprise()) {
		observe('button[aria-describedby*="issue-viewer-subscription-description"]', addButtonIssue, {signal});
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isConversation,
		// Workaround for #6554
		// TODO: remove once the issue is resolved
		pageDetect.isIssueOrPRList,
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
