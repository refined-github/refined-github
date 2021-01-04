import './split-issue-pr-search-results.css';
import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import SearchQuery from '../github-helpers/search-query';

function cleanLinks(): void {
	for (const link of select.all('a.menu-item')) {
		new SearchQuery(link).remove('is:pr', 'is:issue');
	}
}

type GitHubConversationType = 'pr' | 'issue';

function createUrl(type: GitHubConversationType, pathname = location.pathname): string {
	const url = new URL(pathname, location.origin);
	url.searchParams.set('q', pageSearchQuery.get() + ` is:${type}`);
	url.searchParams.set('type', 'Issues');
	return String(url);
}

let pageSearchQuery: SearchQuery;

function init(): void {
	cleanLinks();
	pageSearchQuery = new SearchQuery(location);

	const issueLink = select([
		'nav.menu a[href*="&type=Issues"]', // Only for GHE
		'a.menu-item[href*="&type=issues"]'
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
	if (pageSearchQuery.includes('is:pr')) {
		// Update UI in PR searches
		issueLink.classList.remove('selected');
		title.textContent = title.textContent!.replace('issue', 'pull request');
	} else if (!pageSearchQuery.includes('is:issue') && /\btype=Issues\b/.test(location.search)) {
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
