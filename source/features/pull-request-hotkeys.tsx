import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): void {
	const tabs = select.all('#partial-discussion-header + .tabnav .tabnav-tab');
	const lastTab = tabs.length - 1;
	const selectedIndex = tabs.findIndex(tab => tab.classList.contains('selected'));

	for (const [index, tab] of tabs.entries()) {
		const keys = [`g ${index + 1}`];

		if (index === selectedIndex - 1 || (selectedIndex === 0 && index === lastTab)) {
			keys.push('g ArrowLeft');
		} else if (index === selectedIndex + 1 || (selectedIndex === lastTab && index === 0)) {
			keys.push('g ArrowRight');
		}

		tab.dataset.hotkey = keys.join(',');
	}
}

void features.add(import.meta.url, {
	shortcuts: {
		'g 1': 'Go to Conversation',
		'g 2': 'Go to Commits',
		'g 3': 'Go to Checks',
		'g 4': 'Go to Files changed',
		'g →': 'Go to next PR tab',
		'g ←': 'Go to previous PR tab',
	},
	include: [
		pageDetect.isPR,
	],
	deduplicate: false,
	init,
});
