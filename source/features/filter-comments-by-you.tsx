import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import {getUsername, getRepoURL} from '../libs/utils';

const repoUrl = getRepoURL();

function init(): void {
	select('.subnav-search-context li:last-child')!
		.before(
			<li>
				<a
					href={`/${repoUrl}/issues?q=is%3Aopen+commenter:${getUsername()}`}
					className="select-menu-item"
					role="menuitem">
						Everything commented by you
				</a>
			</li>
		);
}

features.add({
	id: 'filter-comments-by-you',
	description: 'Search for issues and pull requests with the "Everything commented by you filter"',
	include: [
		features.isRepoDiscussionList
	],
	load: features.onAjaxedPages,
	init
});
