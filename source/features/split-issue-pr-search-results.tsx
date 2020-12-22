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

function getPageSearchQuery(): SearchQuery {
	const searchParameters = new URLSearchParams(location.search);
	return new SearchQuery(searchParameters);
}

type GitHubConversationType = 'pr' | 'issue';

function createUrl(type: GitHubConversationType, pathname = location.pathname): string {
	const url = new URL(pathname, location.origin);
	const searchQuery = getPageSearchQuery();
	// Remove all existing is:pr/issue query parts, only the last is used anyways
	searchQuery.remove('is:pr', 'is:issue');
	searchQuery.add(`is:${type}`);
	url.searchParams.set('q', searchQuery.get());
	url.searchParams.set('type', 'Issues');
	return String(url);
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
	const searchQuery = getPageSearchQuery();

	const issueLink = select<HTMLAnchorElement>([
		'nav.menu a[href*="&type=Issues"]', // Only for GHE
		'.menu-item[href*="&type=issues"]'
	])!;
	issueLink.textContent = 'Issues'; // Drops any possible counter
	issueLink.href = createUrl('issue');
	issueLink.append(
		<include-fragment src={createUrl('issue', location.pathname + '/count')}/>
	);

	const prLink = issueLink.cloneNode(true);
	prLink.textContent = 'Pull requests';
	prLink.href = createUrl('pr');
	prLink.append(
		<include-fragment src={createUrl('pr', location.pathname + '/count')}/>
	);

	issueLink.after(prLink);

	const title = select('.codesearch-results h3')!.firstChild!;

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
