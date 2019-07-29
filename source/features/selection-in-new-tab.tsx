import select from 'select-dom';
import features from '../libs/features';
import {isEditable} from '../libs/dom-utils';

function init(): void {
	document.addEventListener('keypress', (event: KeyboardEvent) => {
		const selected = select<HTMLAnchorElement>('.navigation-focus .js-navigation-open[href]');
		if (selected && event.key === 'O' && !isEditable(event.target)) {
			browser.runtime.sendMessage({
				openUrls: [selected.href]
			});

			// Get the list element that contains the unread class and mark it as read.
			selected.closest('li')!.classList.replace('unread', 'read');
		}
	});
}

features.add({
	id: __featureName__,
	description: 'Adds a keyboard shortcut to open selection in new tab when navigating via  `j` and `k`: `Shift` `o`.',
	screenshot: false,
	shortcuts: {
		'shift o': 'Open selection in new tab'
	},
	init
});
