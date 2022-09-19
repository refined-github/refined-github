import select from 'select-dom';
import onetime from 'onetime';

import features from '.';
import {registerHotkey} from '../github-helpers/hotkey';

function openInNewTab(): void {
	const selected = select('.navigation-focus a.js-navigation-open[href]');
	if (!selected) {
		return;
	}

	void browser.runtime.sendMessage({
		openUrls: [selected.href],
	});

	// Get the list element that contains the unread class and mark it as read.
	selected.closest('.unread')?.classList.replace('unread', 'read');
}

function init(): void {
	registerHotkey('O', openInNewTab);
}

void features.add(import.meta.url, {
	include: [
		() => select.exists('.js-navigation-open'),
	],
	shortcuts: {
		'shift o': 'Open selection in new tab',
	},
	deduplicate: false,
	init: onetime(init),
});
