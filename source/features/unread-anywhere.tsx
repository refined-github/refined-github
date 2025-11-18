import {$$optional, $optional} from 'select-dom/strict.js';
import {messageRuntime} from 'webext-msg';
import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import ArrowUpRightIcon from 'octicons-plain-react/ArrowUpRight';

import features from '../feature-manager.js';
import {registerHotkey} from '../github-helpers/hotkey.js';
import onetime from '../helpers/onetime.js';
import showToast from '../github-helpers/toast.js';
import {fetchDomUncached} from '../helpers/fetch-dom.js';
import pluralize from '../helpers/pluralize.js';
import {removeLinkToPRFilesTab} from './pr-notification-link.js';
import observe from '../helpers/selector-observer.js';
import {getClasses, isSmallDevice} from '../helpers/dom-utils.js';

const limit = 5;

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
			removeLinkToPRFilesTab(notification); // Internally limited to PR Files links
			return notification.href;
		});

		await messageRuntime({
			openUrls: urls,
		});

		if (notifications.length > limit) {
			updateToast(`Opened the last ${limit} unread notifications`);
		} else {
			updateToast(pluralize(urls.length, '$$ notification') + ' opened');
			// Update the UI too. Optional because the UI is often out of date
			$optional('.AppHeader-button--hasIndicator')?.classList.remove('AppHeader-button--hasIndicator');
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

function addButton(nativeLink: HTMLAnchorElement): void {
	const classes = getClasses(nativeLink);
	classes.delete('AppHeader-button--hasIndicator');
	// Reverse order so that the new button is painted below the "unread indicator"
	nativeLink.parentElement!.classList.add('d-flex', 'flex-row-reverse');
	nativeLink.classList.add('AppHeader-buttonLeft');
	const button = (
		<button
			type="button"
			onClick={openUnreadNotifications}
			// Show pointer cursor even when disabled
			style={{width: 10, cursor: 'pointer'}}

			// JSX swallows \n if you skip {''}
			aria-label={'Open unread notifications\nHotkey: g u'}
		>
			<ArrowUpRightIcon className="mb-2" />
		</button>
	);
	nativeLink.before(button);
	button.classList.add(
		...classes,
		'AppHeader-buttonRight',
		'tooltipped',
		'tooltipped-sw',
	);
}

// No signal, created once per load
function initOnce(): void {
	registerHotkey('g u', openUnreadNotifications);
	document.documentElement.classList.add('rgh-unread-anywhere');
	observe('a#AppHeader-notifications-button.AppHeader-button--hasIndicator', addButton);
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
