import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import delegate, {type DelegateEvent} from 'delegate-it';
import CheckCircleIcon from 'octicons-plain-react/CheckCircle';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import {fetchDomUncached} from '../helpers/fetch-dom.js';
import showToast from '../github-helpers/toast.js';
import delay from '../helpers/delay.js';
import {getIdentifiers} from '../helpers/feature-helpers.js';

const markAllDone = getIdentifiers('mark-all-notifications-done');

// The "View all X notifications" overflow link in a grouped repo section
// goes to /notifications?query=repo%3Aowner%2Frepo
const viewAllSelector = 'a[href^="/notifications?query="]';

function findViewAllLink(group: Element): HTMLAnchorElement | undefined {
	for (const link of group.querySelectorAll<HTMLAnchorElement>(viewAllSelector)) {
		if (link.textContent?.trim().startsWith('View all')) {
			return link;
		}
	}

	return undefined;
}

async function markNotificationDone(notification: Element): Promise<void> {
	const doneButton = notification.querySelector('[title="Done"]');
	if (!doneButton) {
		return;
	}

	const form = doneButton.closest('form');
	if (!form) {
		return;
	}

	const action = new URL(form.getAttribute('action')!, location.origin).href;
	// FormData includes GitHub's authenticity_token hidden input, handling CSRF automatically
	const response = await fetch(action, {
		method: form.method.toUpperCase(),
		body: new FormData(form),
	});
	if (!response.ok) {
		throw new Error(response.statusText);
	}
}

async function handleMarkAllDone(event: DelegateEvent<MouseEvent>): Promise<void> {
	const button = event.delegateTarget as HTMLButtonElement;
	button.disabled = true;

	const group = button.closest('.js-notifications-group')!;
	const viewAllLink = findViewAllLink(group);
	if (!viewAllLink) {
		button.disabled = false;
		return;
	}

	let processed = 0;
	let failures = 0;

	await showToast(async progress => {
		let url: string | undefined = viewAllLink.href;

		while (url) {
			let page: DocumentFragment;
			try {
				// eslint-disable-next-line no-await-in-loop
				page = await fetchDomUncached(url);
			} catch {
				failures++;
				break;
			}

			const notifications = [...page.querySelectorAll('.notifications-list-item')];

			for (const notification of notifications) {
				try {
					// eslint-disable-next-line no-await-in-loop
					await markNotificationDone(notification);
				} catch {
					failures++;
				}

				processed++;
				progress(`Marking as done: ${processed}…`);
				// eslint-disable-next-line no-await-in-loop
				await delay(100);
			}

			const nextHref = page.querySelector('a[aria-label="Next"]')?.getAttribute('href');
			url = nextHref ? new URL(nextHref, location.origin).href : undefined;
		}

		if (failures < processed) {
			group.remove();
		} else {
			button.disabled = false;
		}

		progress(
			failures > 0
				? `${processed - failures} notifications marked as done (${failures} failed)`
				: `${processed} notifications marked as done`,
		);
	}, {
		message: 'Marking all notifications as done…',
		doneMessage: false, // Use last progress() message as the final toast
	});
}

function addMarkAllDoneButton(markReadButton: HTMLElement): void {
	const group = markReadButton.closest('.js-notifications-group')!;
	if (!findViewAllLink(group)) {
		return; // No overflow, no need for this button
	}

	markReadButton.after(
		<button
			type="button"
			className={'btn btn-sm ml-2 tooltipped tooltipped-w ' + markAllDone.class}
			aria-label="Mark all notifications in this repository as done, including hidden ones"
		>
			<CheckCircleIcon width={16} className="mr-1" /> Mark all as done
		</button>,
	);
}

function init(signal: AbortSignal): void {
	delegate(markAllDone.selector, 'click', handleMarkAllDone, {signal});
	observe('.js-grouped-notifications-mark-all-read-button', addMarkAllDoneButton, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isNotifications,
	],
	init,
});

/*

Test URLs:

https://github.com/notifications (Grouped by repo, with a repo having more notifications than shown)

*/
