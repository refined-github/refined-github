import {React} from 'dom-chef/react';
import select from 'select-dom';
import features from '../libs/features';
import {getUsername} from '../libs/utils';
import {isGlobalIssueSearch} from '../libs/page-detect';

function init() {
	const username = getUsername();
	const type = isGlobalIssueSearch() ? 'issue' : 'pr';

	const commentedMenuItem = <a href={`${location.pathname}?q=is%3Aopen+archived%3Afalse+is%3A${type}+commenter%3A${username}`} class="subnav-item">Commented</a>;

	if (!select.exists('.subnav-links .selected') && location.search.includes(`commenter%3A${username}`)) {
		commentedMenuItem.classList.add('selected');
		for (const tab of select.all(`.subnav-links a[href*="commenter%3A${username}"]`)) {
			tab.href = tab.href.replace(`commenter%3A${username}`, '');
		}
	}

	select('.subnav-links').append(commentedMenuItem);
}

features.add({
	id: 'commented-menu-item',
	include: [
		features.isGlobalIssueSearch,
		features.isGlobalPRSearch
	],
	load: features.onAjaxedPages,
	init
});
