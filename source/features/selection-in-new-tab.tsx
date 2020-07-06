import select from 'select-dom';

import features from '.';
import {isEditable} from '../helpers/dom-utils';

function openInNewTab({key, target}: KeyboardEvent): void {
	const selected = select<HTMLAnchorElement>('.navigation-focus .js-navigation-open[href]');
	if (selected && key === 'O' && !isEditable(target)) {
		void browser.runtime.sendMessage({
			openUrls: [selected.href]
		});

		// Get the list element that contains the unread class and mark it as read.
		selected.closest('.unread')?.classList.replace('unread', 'read');
	}
}

function init(): void {
	document.addEventListener('keypress', openInNewTab);
}

void features.add({
	id: __filebasename,
	description: 'Adds a keyboard shortcut to open selection in new tab when navigating via `j` and `k`: `Shift` `o`.',
	screenshot: false,
	shortcuts: {
		'shift o': 'Open selection in new tab'
	}
}, {
	waitForDomReady: false,
	repeatOnAjax: false,
	init
});
