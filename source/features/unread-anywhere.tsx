import {$$} from 'select-dom';

import {messageRuntime} from 'webext-msg';

import features from '../feature-manager.js';
// eslint-disable-next-line unicorn/prevent-abbreviations
import {modKey, registerHotkey} from '../github-helpers/hotkey.js';
import onetime from '../helpers/onetime.js';
import showToast from '../github-helpers/toast.js';
import fetchDom from '../helpers/fetch-dom.js';
import pluralize from '../helpers/pluralize.js';

const limit = 10;

async function openUnreadNotifications(): Promise<void> {
	await showToast(async updateToast => {
		const page = await fetchDom('https://github.com/notifications?query=is%3Aunread');

		const notifications = $$('a.js-navigation-open', page);
		if (notifications.length === 0) {
			updateToast('No unread notifications');
			return;
		}

		updateToast('Opening…');
		const urls = notifications.slice(0, limit).map(notification => notification.href);
		await messageRuntime({
			openUrls: urls,
		});

		updateToast(
			notifications.length > limit
				? `Opened the last ${limit} unread notifications`
				: pluralize(urls.length, '$$ notification') + ' opened',
		);
	}, {
		message: 'Loading notifications…',
		doneMessage: false,
	});
}

function init(signal: AbortSignal): void {
	registerHotkey('Mod+u', openUnreadNotifications, {signal});
}

void features.add(import.meta.url, {
	shortcuts: {
		[`${modKey} u`]: 'Open unread notifications',
	},
	init: onetime(init),
});
