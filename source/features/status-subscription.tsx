import React from 'dom-chef';
import {mount, unmount} from 'svelte';
import * as pageDetect from 'github-url-detection';
import {$, $optional, closestElement} from 'select-dom';

import features from '../feature-manager.js';
import {getConversationNumber, getRepo} from '../github-helpers/index.js';
import observe from '../helpers/selector-observer.js';
import StatusSubscription from './status-subscription.svelte';

type SubscriptionStatus = 'none' | 'all' | 'status';

const githubApiBaseHeaders = new Headers({
	accept: 'application/json',
	'github-verified-fetch': 'true',
	'x-github-client-version':
		'Refined GitHub. Please address https://github.com/orgs/community/discussions/132506#discussioncomment-11294985',
	credentials: 'include',
});

function getLegacyReason(subscriptionButton: HTMLButtonElement): HTMLParagraphElement {
	return $('p.reason', closestElement('.thread-subscription-status', subscriptionButton));
}

function getLegacyStatus(button: HTMLButtonElement): SubscriptionStatus {
	const reason = getLegacyReason(button).textContent;
	if (reason.includes('custom settings')) {
		return 'status';
	}

	if (reason.includes('not receiving')) {
		return 'none';
	}

	return 'all';
}

function addLegacyButton(subscriptionButton: HTMLButtonElement): void {
	const status = getLegacyStatus(subscriptionButton);
	const originalId = subscriptionButton.form!.elements.id;

	const container = <div /> as unknown as HTMLDivElement;
	subscriptionButton.after(container);

	mount(StatusSubscription, {
		target: container,
		props: {status, isLegacy: true},
	});

	originalId.remove();
	subscriptionButton.hidden = true;

	if (status !== 'all') {
		getLegacyReason(subscriptionButton).hidden = true;
	}
}

async function fetchIssueData(): Promise<Record<string, any>> {
	const {owner, name} = getRepo()!;
	const body = {
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

const mountedComponents = new WeakMap<HTMLButtonElement, ReturnType<typeof mount>>();

async function addButton(subscriptionButton: HTMLButtonElement): Promise<void> {
	const previousRghButton = $optional('.rgh-status-subscription', subscriptionButton.parentElement!);

	const issue = await fetchIssueData();
	const {id, viewerThreadSubscriptionFormAction, viewerCustomSubscriptionEvents} = issue.repository.issue;
	const isSubscribed = viewerThreadSubscriptionFormAction === 'UNSUBSCRIBE';
	const status: SubscriptionStatus = isSubscribed
		? (viewerCustomSubscriptionEvents.length > 0 ? 'status' : 'all')
		: 'none';

	const makeOnClick = (target: SubscriptionStatus) => async () => {
		const fieldset = subscriptionButton.parentElement!.querySelector<HTMLFieldSetElement>('fieldset.rgh-status-subscription');
		if (fieldset) {
			fieldset.disabled = true;
		}

		await updateSubscription(target, id);
		void addButton(subscriptionButton);
	};

	const container = <div /> as unknown as HTMLDivElement;
	subscriptionButton.after(container);

	const component = mount(StatusSubscription, {
		target: container,
		props: {
			status,
			isLegacy: false,
			onNone: makeOnClick('none'),
			onAll: makeOnClick('all'),
			onStatus: makeOnClick('status'),
		},
	});

	const previous = mountedComponents.get(subscriptionButton);
	if (previous) {
		unmount(previous);
	}

	mountedComponents.set(subscriptionButton, component);

	previousRghButton?.remove();
	subscriptionButton.hidden = true;
}

function init(signal: AbortSignal): void {
	observe('button[data-thread-subscribe-button]:enabled', addLegacyButton, {signal});
	if (!pageDetect.isEnterprise()) {
		observe('button[aria-describedby*="issue-viewer-subscription-description"]', addButton, {signal});
	}
}

void features.add(import.meta.url, {
	include: [pageDetect.isConversation],
	awaitDomReady: true,
	init,
});
