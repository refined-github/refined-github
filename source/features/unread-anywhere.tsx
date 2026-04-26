import './unread-anywhere.css';

import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import ArrowUpRightIcon from 'octicons-plain-react/ArrowUpRight';
import {$, $$optional} from 'select-dom';
import {messageRuntime} from 'webext-msg';

import features from '../feature-manager.js';
import {registerHotkey} from '../github-helpers/hotkey.js';
import showToast from '../github-helpers/toast.js';
import {getClasses, isSmallDevice, wrap} from '../helpers/dom-utils.js';
import {fetchDomUncached} from '../helpers/fetch-dom.js';
import onetime from '../helpers/onetime.js';
import pluralize from '../helpers/pluralize.js';
import observe from '../helpers/selector-observer.js';
import {removeLinkToPrFilesTab} from './pr-notification-link.js';

const limit = 5;

const buttonWithNotificationsSelector = 'a[class*="notificationIndicator"]';

function removeNotificationIndicator(element: HTMLElement): void {
	for (const className of element.classList) {
		if (className.includes('notificationIndicator')) {
			element.classList.remove(className);
		}
	}
}

async function openUnreadNotifications(event?: React.MouseEvent): Promise<void> {
	if (event?.target instanceof HTMLButtonElement) {
		// Hide the tooltip
		event.target.blur();
		event.target.disabled = true; // Prevent multiple clicks
	}

	await showToast(async updateToast => {
		const page = await fetchDomUncached('/notifications?query=is%3Aunread');

		const notifications = $$optional('a.js-navigation-open', page);
		if (notifications.length === 0) {
			updateToast('No unread notifications');
			return;
		}

		updateToast('Opening…');
		const urls = notifications.slice(0, limit).map(notification => {
			removeLinkToPrFilesTab(notification); // Internally limited to PR Files links
			return notification.href;
		});

		await messageRuntime({
			openUrls: urls,
		});

		if (notifications.length > limit) {
			updateToast(`Opened the last ${limit} unread notifications`);
		} else {
			updateToast(pluralize(urls.length, '$$ notification') + ' opened');
			// Update the UI too
			removeNotificationIndicator($(buttonWithNotificationsSelector));
		}
	}, {
		message: 'Loading notifications…',
		doneMessage: false,
	}).finally(() => {
		if (event?.target instanceof HTMLButtonElement) {
			event.target.disabled = false;
		}
	});
}

async function addButton(nativeLink: HTMLAnchorElement): Promise<void> {
	const classes = getClasses(nativeLink);
	const button = (
		<button
			type="button"
			onClick={openUnreadNotifications}
			// Show pointer cursor even when disabled
			style={{width: 14, cursor: 'pointer'}}
			// JSX swallows \n if you skip {''}
			aria-label={'Open unread notifications\nHotkey: g u'}
		>
			<ArrowUpRightIcon className="mb-2" />
		</button>
	);

	// Reverse order so that the new button is painted below the "unread indicator"
	// Also has an rgh- class so that it can be targeted via CSS and deduplicated
	wrap(nativeLink, <div className="d-flex flex-row-reverse rgh-unread-anywhere-wrapper" />);

	nativeLink.before(button);
	button.setAttribute('data-variant', 'invisible'); // Enables hover style
	button.classList.add(
		...classes,
		'tooltipped',
		'tooltipped-sw',
		'rounded-left-0',
		'border-left-0',
	);

	removeNotificationIndicator(button);
}

// No signal, created once per load
function initOnce(): void {
	registerHotkey('g u', openUnreadNotifications);
	document.documentElement.classList.add('rgh-unread-anywhere');
	observe(buttonWithNotificationsSelector + ':not(.rgh-unread-anywhere-wrapper *)', addButton);
}

void features.add(import.meta.url, {
	shortcuts: {
		'g u': 'Open all unread notifications from anywhere',
	},
	exclude: [
		// Disable the feature entirely on small screens
		isSmallDevice,

		// Can't work on gists due to CORS: https://github.com/refined-github/refined-github/issues/8641
		pageDetect.isGist,
	],
	init: onetime(initOnce),
});

/*

Test URLs: anywhere :)

*/
