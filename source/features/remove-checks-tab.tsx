/*
The `checks` tab in PR is removed unless you're owner
*/

import select from 'select-dom';
import features from '../libs/features';
import {safeElementReady} from '../libs/dom-utils';

async function init() {
	// If there's a settings tab, the current user can enable checks,
	// so the tab should not be hidden
	if (select.exists([
		'.js-repo-nav [data-selected-links^="repo_settings"]', // In repos
		'.pagehead-tabs-item[href$="/settings/profile"]' // In organizations
	].join())) {
		return;
	}

	// Only remove the tab if it's not the current page and if it has 0 checks
	const checksCounter = await safeElementReady('[data-hotkey="g 3"]:not(.selected) .Counter');

	if (checksCounter && checksCounter.textContent!.trim() === '0') {
		checksCounter.parentElement!.remove();
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
