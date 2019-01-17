import {React} from 'dom-chef/react';
import select from 'select-dom';
import features from '../libs/features';
import {getUsername} from '../libs/utils';

function init() {
	const username = getUsername();

	const yoursMenuItem = <a href={`${location.pathname}?q=is%3Aopen+archived%3Afalse+is%3Aissue+user%3A${username}`} class="subnav-item">Yours</a>;

	if (!select.exists('.subnav-links .selected') && location.search.includes(`user%3A${username}`)) {
		yoursMenuItem.classList.add('selected');
		for (const tab of select.all(`.subnav-links a[href*="user%3A${username}"]`)) {
			tab.href = tab.href.replace(`user%3A${username}`, '');
		}
	}

	select('.subnav-links').append(yoursMenuItem);
}

features.add({
	id: 'yours-menu-item',
	include: [
		features.isGlobalIssueSearch,
		features.isGlobalPRSearch
	],
	load: features.onAjaxedPages,
	init
});
