/** @jsx h */
import './global-conversation-list-filters.css';

import {h} from 'preact';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import render from '../helpers/render';
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
		['Commented', `${typeName} you’ve commented on`, `commenter:${getUsername()}`],
		['Yours', `${typeName} on your repos`, `user:${getUsername()}`]
	] as const;

	for (const [label, title, query] of links) {
		// Create link
		const url = new URL(location.pathname, location.origin);
		url.searchParams.set('q', `${typeQuery} ${defaultQuery} ${query}`);

		const isCurrentPage = new SearchQuery(location.search).includes(query);
		const isNoOtherPage = isCurrentPage && !select.exists('.subnav-links .selected');

		const link = <a href={String(url)} title={title} className={`subnav-item ${isNoOtherPage ? 'selected' : ''}`}>{label}</a>;

		if (isNoOtherPage) {
			// Other links will keep the current query, that's not what we want
			for (const otherLink of select.all('.subnav-links a')) {
				new SearchQuery(otherLink).remove(query);
			}
		}

		select('.subnav-links')!.append(render(link));
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.isGlobalConversationList
	],
	init
});
