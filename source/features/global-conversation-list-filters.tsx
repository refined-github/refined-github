import './global-conversation-list-filters.css';

import React from 'dom-chef';
import {$optional, $$optional} from 'select-dom/strict.js';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import SearchQuery from '../github-helpers/search-query.js';
import observe from '../helpers/selector-observer.js';

function createLink(label: string, title: string, query: string): HTMLElement {
	const url = new URL('/pulls', location.origin);
	url.searchParams.set('q', `is:open archived:false ${query}`);
	const link = <a href={url.href} title={title} className="subnav-item">{label}</a>;

	const isCurrentPage = SearchQuery.from(location).includes(query);

	// Highlight it, if that's the current page
	if (isCurrentPage && !$optional('.subnav-links .selected')) {
		link.classList.add('selected');

		// Other links will keep the current query, that's not what we want
		for (const otherLink of $$optional('.subnav-links a')) {
			otherLink.href = SearchQuery.from(otherLink).remove(query).href;
		}
	}

	return link;
}

function addLinks(container: HTMLElement): void {
	container.append(
		createLink('Involved', 'Pull Requests you’re involved in', 'involves:@me'),
		createLink('Yours', 'Pull Requests on your repos', 'user:@me'),
	);
}

function init(signal: AbortSignal): void {
	observe('.subnav-links', addLinks, {signal});
}

void features.add(import.meta.url, {
	asLongAs: [
		pageDetect.isGlobalIssueOrPRList,
		pageDetect.isPRList, // We don't have a single `isGlobalPRList`
	],
	init,
});

/*

Test URLs:

https://github.com/pulls

*/
