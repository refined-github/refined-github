import select from 'select-dom';
import features from '../libs/features';

function init() {
	document.addEventListener('keypress', event => {
		const selected = select<HTMLAnchorElement>('.navigation-focus .js-navigation-open[href]');
		if (selected && event.key === 'O') {
			browser.runtime.sendMessage({
				urls: [selected.href],
				action: 'openAllInTabs'
			});

			// Get the list element that contains the unread class and mark it as read.
			selected.closest('li').classList.replace('unread', 'read');
		}
	});
}

features.add({
	id: 'selection-in-new-tab',
	description: 'Open selection in new tab with `shift o` when navigating via `j` and `k`',
	shortcuts: {
		'shift o': 'Open selection in new tab'
	},
	init
});
