import {$$} from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import {addHotkey} from '../github-helpers/hotkey.js';

async function init(): Promise<void> {
	const tabnav = await elementReady('#partial-discussion-header + .tabnav');
	const tabs = $$('a.tabnav-tab', tabnav);
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
		'g <number>': 'Go to PR tab <number>',
		'g →': 'Go to next PR tab',
		'g ←': 'Go to previous PR tab',
	},
	include: [
		pageDetect.isPR,
	],
	init,
});
