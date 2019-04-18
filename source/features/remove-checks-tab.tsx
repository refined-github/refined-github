/*
The `checks` tab in PR is removed unless you're owner
*/

import select from 'select-dom';
import features from '../libs/features';
import {safeElementReady} from '../libs/dom-utils';

async function init() {
	const checksTab = await safeElementReady(`
		[data-hotkey="g 3"]
	`); // Wait for the tab to be loaded

	if (!checksTab) {
		return;
	}

	const counter = select('.Counter', checksTab);
	if (!counter || !counter.textContent) {
		return;
	}

	// Only remove the tab if it's not the current page and if it has 0 checks
	if (!checksTab.matches('.selected') && counter.textContent.trim() === '0') {
		checksTab.remove();
	}
}

features.add({
	id: 'remove-checks-tab',
	include: [
		features.isPR
	],
	exclude: [
		features.isOwnRepo
	],
	load: features.onAjaxedPages,
	init
});
