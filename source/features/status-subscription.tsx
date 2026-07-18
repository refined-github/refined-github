import {mount} from 'svelte';
import {writable, readable} from 'svelte/store';
import * as pageDetect from 'github-url-detection';
import {$} from 'select-dom';

import features from '../feature-manager.js';
import {getConversationNumber, getRepo} from '../github-helpers/index.js';
import observe from '../helpers/selector-observer.js';
import StatusSubscription from './status-subscription.svelte';

export type SubscriptionStatus = 'none' | 'all' | 'status';

function getSubscriptionReasonElement(): HTMLParagraphElement {
	return $([
		'#issue-viewer-subscription-description',
		'#notification-subscribe-button-reason', // Legacy
	]);
}

function getSubscriptionReason(): SubscriptionStatus {
	const reason = getSubscriptionReasonElement().textContent;

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

// TODO: Move to CSS after legacy version is dropped
function toggleSubscriptionReason(status: SubscriptionStatus): void {
	// 'all' can have many reasons, but the other two don't add further information #6684
	getSubscriptionReasonElement().hidden = status !== 'all';
}

function addLegacyButton(nativeButton: HTMLButtonElement): void {
	const initialStatus = getSubscriptionReason();

	// The whole block is removed and re-loaded in the legacy version, so these don't need to be writable
	const status = readable(initialStatus);
	const disabled = readable(false);

	// Save first
	const originalId = nativeButton.form!.elements.id;

	mount(StatusSubscription, {
		target: nativeButton.parentElement!,
		anchor: nativeButton,
		props: {
			status,
			disabled,
			isLegacy: true,
		},
	});

	// Remove it only if the form was successfully added
	originalId.remove();
	nativeButton.hidden = true;

	toggleSubscriptionReason(initialStatus);
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

async function renderWidget(nativeButton: HTMLButtonElement): Promise<void> {
	const issue = await fetchIssueData();
	const {id, viewerThreadSubscriptionFormAction, viewerCustomSubscriptionEvents} = issue.repository.issue;

	const initialStatus = viewerThreadSubscriptionFormAction === 'UNSUBSCRIBE'
		? 'none'
		: viewerCustomSubscriptionEvents.length > 0
			? 'status'
			: 'all';

	const status = writable<SubscriptionStatus>(initialStatus);
	const disabled = writable(false);

	const makeOnClick = (target: SubscriptionStatus) => async () => {
		disabled.set(true);

		try {
			await updateSubscription(target, id);

			status.set(target);
			toggleSubscriptionReason(target);
		} finally {
			disabled.set(false);
		}
	};

	mount(StatusSubscription, {
		target: nativeButton.parentElement!,
		anchor: nativeButton,
		props: {
			status,
			disabled,
			isLegacy: false,
			onNone: makeOnClick('none'),
			onAll: makeOnClick('all'),
			onStatus: makeOnClick('status'),
		},
	});

	toggleSubscriptionReason(initialStatus);
	nativeButton.hidden = true;
}

function init(signal: AbortSignal): void {
	// Repos you're ignoring can't be subscribed to, so the button is disabled
	observe('button[data-thread-subscribe-button]:enabled', addLegacyButton, {signal});
	if (!pageDetect.isEnterprise()) {
		observe('button[aria-describedby*="issue-viewer-subscription-description"]', renderWidget, {signal});
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
