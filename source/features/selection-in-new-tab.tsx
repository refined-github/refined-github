import {$} from 'select-dom';
import onetime from 'onetime';

import features from '../feature-manager.js';
import {registerHotkey} from '../github-helpers/hotkey.js';

function openInNewTab(): void {
	const selected = $('.navigation-focus a.js-navigation-open[href]');
	if (!selected) {
		return;
	}

	void browser.runtime.sendMessage({
		openUrls: [selected.href],
	});

	// Get the list element that contains the unread class and mark it as read.
	selected.closest('.unread')?.classList.replace('unread', 'read');
}

function init(signal: AbortSignal): void {
	registerHotkey('O', openInNewTab, {signal});
}

void features.add(import.meta.url, {
	shortcuts: {
		'shift o': 'Open selection in new tab',
	},
	init: onetime(init),
});

/*

Test URLs:

https://github.com/notifications
https://github.com/refined-github/refined-github
https://github.com/refined-github/refined-github/issues

*/
