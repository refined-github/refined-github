import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import onElementRemoval from '../helpers/on-element-removal';

async function init(): Promise<void> {
	const selectAllNotifications = await elementReady('.js-notifications-mark-all-prompt');
	if (selectAllNotifications) { // Notifications page may be empty
		selectAllNotifications.dataset.hotkey = 'a';
		await onElementRemoval(selectAllNotifications); // "Select all" checkbox will be replaced if there's more notifications to load #4199
		void init();
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isNotifications,
	],
	awaitDomReady: false,
	init,
});
