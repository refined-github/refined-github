import './global-discussion-list-filters.css';
import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';
import {getUsername} from '../libs/utils';
import SearchQuery from '../libs/search-query';

function init(): void {
	const defaultQuery = 'is:open archived:false';

	// Without this, the Issues page also displays PRs, and viceversa
	const isIssues = location.pathname.startsWith('/issues');
	const typeQuery = isIssues ? 'is:issue' : 'is:pr';
	const typeName = isIssues ? 'Issues' : 'Pull Requests';

	const links = [
		['Commented', `${typeName} you’ve commented on`, `commenter:${getUsername()}`],
		['Yours', `${typeName} on your repos`, `user:${getUsername()}`]
	];

	for (const [label, title, query] of links) {
		// Create link
		const url = new URL(location.pathname, location.origin);
		url.searchParams.set('q', `${typeQuery} ${defaultQuery} ${query}`);
		const link = <a href={String(url)} title={title} className="subnav-item">{label}</a>;

		const isCurrentPage = new SearchQuery(location).includes(query);

		// Highlight it, if that's the current page
		if (isCurrentPage && !select.exists('.subnav-links .selected')) {
			link.classList.add('selected');

			// Other links will keep the current query, that's not what we want
			for (const otherLink of select.all<HTMLAnchorElement>('.subnav-links a')) {
				new SearchQuery(otherLink).remove(query);
			}
		}

		select('.subnav-links')!.append(link);
	}
}

features.add({
	id: __filebasename,
	description: 'Adds filters for discussions _in your repos_ and _commented on by you_ in the global discussion search.',
	screenshot: 'https://user-images.githubusercontent.com/8295888/36827126-8bfc79c4-1d37-11e8-8754-992968b082be.png'
}, {
	include: [
		pageDetect.isGlobalDiscussionList
	],
	init
});
