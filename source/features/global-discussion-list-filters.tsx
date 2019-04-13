import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import {getUsername} from '../libs/utils';

function init() {
	const defaultQuery = 'is:open archived:false ';

	// Without this, the Issues page also displays PRs, and viceversa
	const types: { [path: string]: string } = {
		'/issues': 'is:issue ',
		'/pulls': 'is:pr '
	};
	const type = types[location.pathname] || '';

	const links = [
		['Commented', `commenter:${getUsername()}`],
		['Yours', `user:${getUsername()}`]
	];

	for (const [label, query] of links) {
		// Create link
		const url = new URLSearchParams([['q', type + defaultQuery + query]]);
		const link = <a href={`?${url}`} className="subnav-item">{label}</a>;

		// Create regex for current query, including possible spaces around it
		const queryRegex = new RegExp(`(^|\\s)${query}(\\s|$)`);
		const isCurrentPage = queryRegex.test(new URLSearchParams(location.search).get('q')!);

		// Highlight it, if that's the current page
		if (isCurrentPage && !select.exists('.subnav-links .selected')) {
			link.classList.add('selected');

			// Other links will keep the current query, that's not what we want
			for (const otherLink of select.all<HTMLAnchorElement>('.subnav-links a')) {
				const search = new URLSearchParams(otherLink.search);
				search.set('q', search.get('q')!.split(' ').filter(s => s !== query).join(' '));
				otherLink.search = String(search);
			}
		}

		select('.subnav-links')!.append(link);
	}
}

features.add({
	id: 'global-discussion-list-filters',
	include: [
		features.isGlobalDiscussionList
	],
	load: features.onAjaxedPages,
	init
});
