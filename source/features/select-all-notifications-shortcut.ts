import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';

async function init(): Promise<void> {
	const selectAllNotifications = await elementReady<HTMLElement>('.js-notifications-mark-all-prompt');
	if (selectAllNotifications) {
		selectAllNotifications.dataset.hotkey = 'a';
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.isNotifications
	],
	awaitDomReady: false,
	init
});
