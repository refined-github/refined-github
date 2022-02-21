import select from 'select-dom';

import features from '.';
import {isEditable} from '../helpers/dom-utils';

function openInNewTab({key, target}: KeyboardEvent): void {
	const selected = select('.navigation-focus a.js-navigation-open[href]');
	if (selected && key === 'O' && !isEditable(target)) {
		void browser.runtime.sendMessage({
			openUrls: [selected.href],
		});

		// Get the list element that contains the unread class and mark it as read.
		selected.closest('.unread')?.classList.replace('unread', 'read');
	}
}

function init(): Deinit {
	document.addEventListener('keypress', openInNewTab);

	return () => {
		document.removeEventListener('keypress', openInNewTab);
	};
}

void features.add(import.meta.url, {
	shortcuts: {
		'shift o': 'Open selection in new tab',
	},
	awaitDomReady: false,
	init,
});
