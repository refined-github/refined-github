import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import {$$} from 'select-dom';

import features from '../feature-manager.js';
import {addHotkey, registerHotkey} from '../github-helpers/hotkey.js';

async function init(signal: AbortSignal): Promise<void> {
	const tabnav = await elementReady([
		'[aria-label="Pull request tabs"]',
		'[aria-label="Pull request navigation tabs"]', // Commits list tab
	]);
	const tabs = $$('a', tabnav);

	for (const [index, tab] of tabs.entries()) {
		addHotkey(tab, `g ${index + 1}`);
	}

	const selectedIndex = tabs.findIndex(tab => tab.matches('.selected, [aria-current]'));
	if (selectedIndex === -1) {
		return;
	}

	const previousTab = tabs.at(selectedIndex - 1) ?? tabs.at(-1)!;
	const nextTab = tabs.at(selectedIndex + 1) ?? tabs[0];
	registerHotkey('g ArrowLeft', () => {
		previousTab.click();
	}, {signal});
	registerHotkey('g ArrowRight', () => {
		nextTab.click();
	}, {signal});
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
