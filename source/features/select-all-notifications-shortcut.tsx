import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {isEditable} from '../helpers/dom-utils';

function runShortcut(event: KeyboardEvent): void {
	if (
		event.key === 'a'
		&& !event.ctrlKey
		&& !event.metaKey
		&& !isEditable(event.target)
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
		pageDetect.isBlank, // Empty notification list
	],
	awaitDomReady: false,
	init,
});
