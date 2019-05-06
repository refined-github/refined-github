/*
The `checks` tab in PR is removed unless you're owner
*/

import select from 'select-dom';
import features from '../libs/features';

function init(): false | void {
	// If there's a settings tab, the current user can enable checks,
	// so the tab should not be hidden
	if (select.exists([
		'.js-repo-nav [data-selected-links^="repo_settings"]', // In repos
		'.pagehead-tabs-item[href$="/settings/profile"]' // In organizations
	].join())) {
		return false;
	}

	// Only remove the tab if it's not the current page and if it has 0 checks
	const checksCounter = select('.tabnav-tab[href$="/checks"]:not(.selected) .Counter');

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
