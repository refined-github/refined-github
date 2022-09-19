import './split-issue-pr-search-results.css';
import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import SearchQuery from '../github-helpers/search-query';

function cleanLinks(): void {
	for (const link of select.all('a.menu-item')) {
		link.href = SearchQuery.from(link).remove('is:pr', 'is:issue').href;
	}
}

type GitHubConversationType = 'pr' | 'issue';

function updateLinkElement(link: HTMLAnchorElement, type: GitHubConversationType): void {
	link.textContent = type === 'pr' ? 'Pull requests' : 'Issues'; // Drops any possible counter
	link.href = SearchQuery.from(link).add(`is:${type}`).href;
	link.append(
		<include-fragment src={`${link.pathname}/count${link.search}`}/>,
	);
}

function init(): void {
	cleanLinks();

	const issueLink = select('a.menu-item[href*="&type=issues"]')!;
	updateLinkElement(issueLink, 'issue');

	// We don't need to clone the child nodes because they get replaced anyways
	const prLink = issueLink.cloneNode();
	updateLinkElement(prLink, 'pr');
	issueLink.after(prLink);

	const title = select('.codesearch-results h3')!.firstChild!;

	const searchQuery = SearchQuery.from(location);
	if (searchQuery.includes('is:pr')) {
		// Update UI in PR searches
		issueLink.classList.remove('selected');
		title.textContent = title.textContent!.replace('issue', 'pull request');
	} else if (!searchQuery.includes('is:issue') && searchQuery.searchParams.get('type')?.toLowerCase() === 'issues') {
		// Update UI in combined searches (where there's no `is:<type>` query)
		title.textContent = title.textContent!
			.replace(/issue\b/, 'issue or pull request')
			.replace('issues', 'issues and pull requests');

		// `.selected` overrides `:hover`, so we need to reapply `:hover`'s style
		prLink.classList.add('rgh-split-issue-pr-combined');
		issueLink.classList.add('rgh-split-issue-pr-combined');
	} else {
		prLink.classList.remove('selected');
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoSearch,
		pageDetect.isGlobalSearchResults,
	],
	deduplicate: 'has-rgh',
	init,
});
