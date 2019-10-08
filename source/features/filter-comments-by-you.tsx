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
	id: __featureName__,
	description: 'Adds a `Everything commented by you` filter in the search box dropdown.',
	screenshot: 'https://user-images.githubusercontent.com/170270/27501170-f394a304-586b-11e7-92d8-d92d6922356b.png',
	include: [
		features.isRepoDiscussionList
	],
	load: features.onAjaxedPages,
	init
});
