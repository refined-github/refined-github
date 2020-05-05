import './split-issue-pr-search-results.css';
import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';
import SearchQuery from '../libs/search-query';

function cleanLinks(): void {
	for (const link of select.all<HTMLAnchorElement>('.menu-item')) {
		new SearchQuery(link).remove('is:pr', 'is:issue');
	}
}

type GitHubDiscussionType = 'pr' | 'issue';

function createUrl(type: GitHubDiscussionType, pathname = location.pathname): string {
	const url = new URL(pathname, location.origin);
	url.searchParams.set('q', pageSearchQuery.get() + ` is:${type}`);
	url.searchParams.set('type', 'Issues');
	return String(url);
}

let pageSearchQuery: SearchQuery;

function init(): void {
	cleanLinks();
	pageSearchQuery = new SearchQuery(location);

	const issueLink = select<HTMLAnchorElement>('nav.menu a[href*="&type=Issues"]')!;
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

features.add({
	id: __filebasename,
	description: 'Separates issues from PRs in the global search.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/52181103-35a09f80-2829-11e9-9c6f-57f2e08fc5b2.png'
}, {
	include: [
		pageDetect.isRepoSearch,
		pageDetect.isGlobalSearchResults
	],
	init
});
