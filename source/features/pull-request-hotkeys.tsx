import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import {$$} from 'select-dom';

import features from '../feature-manager.js';
import {overrideHotkey, registerHotkey} from '../github-helpers/hotkey.js';
import {is} from '../helpers/css-selectors.js';

const tabnavSelectors = [
	'[aria-label="Pull request tabs"]',
	'[aria-label^="Pull request navigation"]',
] as const;

function selectAdjacentTab(offset: number): void {
	const tabs = $$(is(tabnavSelectors) + ' a');
	const selectedIndex = tabs.findIndex(tab => tab.matches(['.selected', '[aria-current]']));
	const adjacentIndex = (selectedIndex + offset + tabs.length) % tabs.length;
	tabs[adjacentIndex].click();
}

function selectPreviousTab(): void {
	selectAdjacentTab(-1);
}

function selectNextTab(): void {
	selectAdjacentTab(1);
}

async function init(signal: AbortSignal): Promise<void> {
	registerHotkey('g ArrowLeft', selectPreviousTab, {signal});
	registerHotkey('g ArrowRight', selectNextTab, {signal});

	const tabnav = await elementReady(tabnavSelectors);
	const tabs = $$('a', tabnav);
	for (const [index, tab] of tabs.entries()) {
		// Reset previous hotkeys because the DOM persists across soft navigations
		overrideHotkey(tab, `g ${index + 1}`);
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
