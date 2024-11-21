import {$optional} from 'select-dom/strict.js';
import {messageRuntime} from 'webext-msg';

import onetime from '../helpers/onetime.js';
import features from '../feature-manager.js';
import {registerHotkey} from '../github-helpers/hotkey.js';

function openInNewTab(): void {
	const selected = $optional('.navigation-focus a.js-navigation-open[href]');
	if (!selected) {
		return;
	}

	void messageRuntime({
		openUrls: [selected.href],
	});

	// Get the list element that contains the unread class and mark it as read.
	selected.closest('.unread')?.classList.replace('unread', 'read');
}

function initOnce(): void {
	registerHotkey('Shift+O', openInNewTab);
}

void features.add(import.meta.url, {
	shortcuts: {
		'shift o': 'Open selection in new tab',
	},
	init: onetime(initOnce),
});

/*

Test URLs:

https://github.com/notifications
https://github.com/refined-github/refined-github
https://github.com/refined-github/refined-github/issues

*/
