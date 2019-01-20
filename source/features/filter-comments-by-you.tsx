import {React} from 'dom-chef/react';
import select from 'select-dom';
import features from '../libs/features';
import {getUsername, getRepoURL} from '../libs/utils';

const repoUrl = getRepoURL();

function init() {
	select('.subnav-search-context li:last-child')
		.before(
			<li>
				<a
					href={`/${repoUrl}/issues?q=is%3Aopen+commenter:${getUsername()}`}
					class="select-menu-item"
					role="menuitem">
						Everything commented by you
				</a>
			</li>
		);
}

features.add({
	id: 'filter-comments-by-you',
	include: [
		features.isIssueList
	],
	load: features.onAjaxedPages,
	init
});
