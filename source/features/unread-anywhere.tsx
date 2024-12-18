import {$, $$optional} from 'select-dom/strict.js';
import {messageRuntime} from 'webext-msg';

import features from '../feature-manager.js';
import {registerHotkey} from '../github-helpers/hotkey.js';
import onetime from '../helpers/onetime.js';
import showToast from '../github-helpers/toast.js';
import {fetchDomUncached} from '../helpers/fetch-dom.js';
import pluralize from '../helpers/pluralize.js';
import {removeLinkToPRFilesTab} from './pr-notification-link.js';

const limit = 10;

async function openUnreadNotifications(): Promise<void> {
	await showToast(async updateToast => {
		const page = await fetchDomUncached('https://github.com/notifications?query=is%3Aunread');

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
			// Update the UI too
			$('.AppHeader-button--hasIndicator').classList.remove('AppHeader-button--hasIndicator');
		}
	}, {
		message: 'Loading notifications…',
		doneMessage: false,
	});
}

function initOnce(): void {
	registerHotkey('g u', openUnreadNotifications);
}

void features.add(import.meta.url, {
	shortcuts: {
		'g u': 'Open all unread notifications from anywhere',
	},
	init: onetime(initOnce),
});

/*

Test URLs: anywhere :)

*/
