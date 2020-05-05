/*

*/

import select from 'select-dom';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';

function init(): false | void {
	// If there's a settings tab, the current user can enable checks,
	// so the tab should not be hidden
	if (select.exists([
		'.js-repo-nav [data-selected-links^="repo_settings"]', // In repos
		'.pagehead-tabs-item[href$="/settings/profile"]' // In organizations
	])) {
		return false;
	}

	// Only remove the tab if it's not the current page and if it has 0 checks
	const checksCounter = select('.tabnav-tab[href$="/checks"]:not(.selected) .Counter');

	if (checksCounter && checksCounter.textContent!.trim() === '0') {
		checksCounter.parentElement!.remove();
	}
}

features.add({
	id: __filebasename,
	description: 'Hides the `Checks` tab if it’s empty, unless you’re the owner.',
	screenshot: false
}, {
	include: [
		pageDetect.isPR
	],
	init
});
