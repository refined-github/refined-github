import select from 'select-dom';
import features from '../libs/features';

function init() {
	document.addEventListener('keypress', event => {
		const selected = select('.navigation-focus .js-navigation-open[href]');
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
	shortcuts: {
		'shift o': 'Open selection in new tab'
	},
	init
});
