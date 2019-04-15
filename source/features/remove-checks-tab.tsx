/*
The `checks` tab in PR is removed unless you're owner
*/

import select from 'select-dom';
import features from '../libs/features';
import {safeElementReady} from '../libs/dom-utils';
import {isOwnRepo} from '../libs/page-detect';

async function init() {
	if (isOwnRepo()) {
		return;
	}

	await safeElementReady(`
		[data-hotkey="g 3"]
	`); // Wait for the tab to be loaded

	const checksTab = select([
		'[data-hotkey="g 3"]'
	].join());

	// Only remove the tab if it's not the current page and if it has 0 projects
	if (!checksTab.matches('.selected') && select('.Counter', checksTab).textContent.trim() === '0') {
		checksTab.remove();
	}
}

features.add({
	id: 'remove-checks-tab',
	include: [
		features.isPR
	],
	load: features.onAjaxedPages,
	init
});
