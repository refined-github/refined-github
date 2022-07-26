import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {addHotkey} from '../github-helpers/hotkey';

function init(): void {
	const tabs = select.all('#partial-discussion-header + .tabnav a.tabnav-tab');
	const lastTab = tabs.length - 1;
	const selectedIndex = tabs.findIndex(tab => tab.classList.contains('selected'));

	for (const [index, tab] of tabs.entries()) {
		addHotkey(tab, `g ${index + 1}`);

		if (index === selectedIndex - 1 || (selectedIndex === 0 && index === lastTab)) {
			addHotkey(tab, 'g ArrowLeft');
		} else if (index === selectedIndex + 1 || (selectedIndex === lastTab && index === 0)) {
			addHotkey(tab, 'g ArrowRight');
		}
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
