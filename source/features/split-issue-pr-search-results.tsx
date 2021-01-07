import './split-issue-pr-search-results.css';
import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import SearchQuery from '../github-helpers/search-query';

function cleanLinks(): void {
	for (const link of select.all<HTMLAnchorElement>('.menu-item')) {
		new SearchQuery(link).remove('is:pr', 'is:issue');
	}
}

type GitHubConversationType = 'pr' | 'issue';

function updateLinkElement(link: HTMLAnchorElement, type: GitHubConversationType): void {
	link.textContent = type === 'pr' ? 'Pull requests' : 'Issues'; // Drops any possible counter

	const searchQuery = new SearchQuery(link);
	searchQuery.add(`is:${type}`);

	link.append(
		<include-fragment src={`${link.pathname}/count${link.search}`}/>
	);
}

// Only the last is:pr/issue query part is used by github for the filter results so we find the one with the higher index
function searchQueryIs(searchQuery: SearchQuery): GitHubConversationType | null {
	const queryParts = searchQuery.getQueryParts();
	const pr = queryParts.lastIndexOf('is:pr');
	const issue = queryParts.lastIndexOf('is:issue');
	if (pr > issue) {
		return 'pr';
	}

	if (issue !== -1) {
		return 'issue';
	}

	return null;
}

function init(): void {
	cleanLinks();

	const issueLink = select<HTMLAnchorElement>([
		'nav.menu a[href*="&type=Issues"]', // Only for GHE
		'.menu-item[href*="&type=issues"]'
	])!;
	updateLinkElement(issueLink, 'issue');

	// We don't need to clone the child nodes because they get replaced anyways
	const prLink = issueLink.cloneNode();
	updateLinkElement(prLink, 'pr');
	issueLink.after(prLink);

	const title = select('.codesearch-results h3')!.firstChild!;

	const searchQuery = new SearchQuery(location.search);
	const is = searchQueryIs(searchQuery);
	if (is === 'pr') {
		// Update UI in PR searches
		issueLink.classList.remove('selected');
		title.textContent = title.textContent!.replace('issue', 'pull request');
	} else if (is !== 'issue' && searchQuery.searchParams.get('type') === 'Issues') {
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

void features.add(__filebasename, {
	include: [
		pageDetect.isRepoSearch,
		pageDetect.isGlobalSearchResults
	],
	init
});
