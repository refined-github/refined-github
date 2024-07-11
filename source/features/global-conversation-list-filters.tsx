import './global-conversation-list-filters.css';
import React from 'dom-chef';
import {$$, elementExists} from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import SearchQuery from '../github-helpers/search-query.js';
import observe from '../helpers/selector-observer.js';

function addLinks(container: HTMLElement): void {
	const defaultQuery = 'is:open archived:false';

	// Without this, the Issues page also displays PRs, and viceversa
	const isIssues = location.pathname.startsWith('/issues');
	const typeQuery = isIssues ? 'is:issue' : 'is:pr';
	const typeName = isIssues ? 'Issues' : 'Pull Requests';

	const links = [
		['Involved', `${typeName} you’re involved in`, 'involves:@me'],
		['Yours', `${typeName} on your repos`, 'user:@me'],
	] as const;

	for (const [label, title, query] of links) {
		// Create link
		const url = new URL(isIssues ? '/issues' : '/pulls', location.origin);
		url.searchParams.set('q', `${typeQuery} ${defaultQuery} ${query}`);
		const link = <a href={url.href} title={title} className="subnav-item">{label}</a>;

		const isCurrentPage = SearchQuery.from(location).includes(query);

		// Highlight it, if that's the current page
		if (isCurrentPage && !elementExists('.subnav-links .selected')) {
			link.classList.add('selected');

			// Other links will keep the current query, that's not what we want
			for (const otherLink of $$('.subnav-links a')) {
				otherLink.href = SearchQuery.from(otherLink).remove(query).href;
			}
		}

		container.append(link);
	}
}

function init(signal: AbortSignal): void {
	observe('.subnav-links', addLinks, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isGlobalIssueOrPRList,
	],
	init,
});
