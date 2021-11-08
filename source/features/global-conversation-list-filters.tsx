import './global-conversation-list-filters.css';
import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import SearchQuery from '../github-helpers/search-query';
import {getUsername} from '../github-helpers';

function init(): void {
	const defaultQuery = 'is:open archived:false';

	// Without this, the Issues page also displays PRs, and viceversa
	const isIssues = location.pathname.startsWith('/issues');
	const typeQuery = isIssues ? 'is:issue' : 'is:pr';
	const typeName = isIssues ? 'Issues' : 'Pull Requests';

	const links = [
		['Commented', `${typeName} you’ve commented on`, `commenter:${getUsername()!}`],
		['Yours', `${typeName} on your repos`, `user:${getUsername()!}`],
	] as const;

	for (const [label, title, query] of links) {
		// Create link
		const url = new URL(isIssues ? '/issues' : '/pulls', location.origin);
		url.searchParams.set('q', `${typeQuery} ${defaultQuery} ${query}`);
		const link = <a href={url.href} title={title} className="subnav-item">{label}</a>;

		const isCurrentPage = new SearchQuery(location.search).includes(query);

		// Highlight it, if that's the current page
		if (isCurrentPage && !select.exists('.subnav-links .selected')) {
			link.classList.add('selected');

			// Other links will keep the current query, that's not what we want
			for (const otherLink of select.all('.subnav-links a')) {
				new SearchQuery(otherLink).remove(query);
			}
		}

		select('.subnav-links')!.append(link);
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isGlobalConversationList,
	],
	init,
});
