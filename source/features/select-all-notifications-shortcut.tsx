import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

function runShortcut(event: KeyboardEvent): void {
	if (
		event.key === 'a'
		&& !event.ctrlKey
		&& !event.metaKey
		&& !event.isComposing
	) {
		select('.js-notifications-mark-all-prompt')!.click();
	}
}

function init(signal: AbortSignal): void {
	// Listen to the shortcut ourselves instead of attaching it to the checkbox #5569
	document.body.addEventListener('keypress', runShortcut, {signal});
}

void features.add(import.meta.url, {
	shortcuts: {
		a: 'Select all notifications',
	},
	include: [
		pageDetect.isNotifications,
	],
	exclude: [
		() => select.exists('img[src$="notifications/inbox-zero.svg"]'), // Don't run on empty inbox page
	],
	awaitDomReady: false,
	init,
});
