import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import {$$} from 'select-dom';

import features from '../feature-manager.js';
import {addHotkey} from '../github-helpers/hotkey.js';

async function init(): Promise<void> {
	const tabnav = await elementReady([
		'[aria-label="Pull request tabs"]',
		'[aria-label="Pull request navigation tabs"]', // Commits list tab
	]);
	const tabs = $$('a', tabnav);
	const lastTab = tabs.length - 1;
	const selectedIndex = tabs.findIndex(tab => tab.matches('.selected, [aria-current]'));

	for (const [index, tab] of tabs.entries()) {
		// Reset previous hotkeys because the DOM persists across soft navigations
		// https://github.com/refined-github/refined-github/pull/9916#issuecomment-5157852083
		delete tab.dataset.hotkey;
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

/*

Test URLs:

https://github.com/refined-github/sandbox/pull/4

*/
