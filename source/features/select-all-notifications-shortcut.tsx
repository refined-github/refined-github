import {$} from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import {registerHotkey} from '../github-helpers/hotkey.js';

function selectAllNotifications(): void {
	$('.js-notifications-mark-all-prompt')!.click();
}

function init(signal: AbortSignal): void {
	registerHotkey('a', selectAllNotifications, {signal});
}

void features.add(import.meta.url, {
	shortcuts: {
		a: 'Select all notifications',
	},
	include: [
		pageDetect.isNotifications,
	],
	exclude: [
		pageDetect.isBlank,
	],
	init,
});

/*

Test URLs:

https://github.com/notifications

*/
