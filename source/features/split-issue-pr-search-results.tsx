import './split-issue-pr-search-results.css';
import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';

function cleanLinks(): void {
	for (const link of select.all<HTMLAnchorElement>('.menu-item')) {
		const searchParameters = new URLSearchParams(link.search);
		searchParameters.set('q', cleanSearchQuery(searchParameters.get('q')!));
		link.search = String(searchParameters);
	}
}

function getSearchQuery(): string {
	return new URLSearchParams(location.search).get('q')!;
}

function cleanSearchQuery(query: string): string {
	return query
		.replace(/\bis:(pr|issue)\b/gi, '')
		.replace(/\s{2,}/g, ' ').trim();
}

type GitHubDiscussionType = 'pr' | 'issue';

function createUrl(type: GitHubDiscussionType, pathname = location.pathname): string {
	const url = new URL(pathname, location.origin);
	url.searchParams.set('q', cleanSearchQuery(getSearchQuery()) + ` is:${type}`);
	url.searchParams.set('type', 'Issues');
	return String(url);
}

function init(): void {
	cleanLinks();

	const issueLink = select<HTMLAnchorElement>('nav.menu a[href*="&type=Issues"]')!;
	issueLink.textContent = 'Issues'; // Drops any possible counter
	issueLink.href = createUrl('issue');
	issueLink.append(
		<include-fragment src={createUrl('issue', location.pathname + '/count')} />
	);

	const prLink = issueLink.cloneNode(true) as HTMLAnchorElement;
	prLink.textContent = 'Pull requests';
	prLink.href = createUrl('pr');
	prLink.append(
		<include-fragment src={createUrl('pr', location.pathname + '/count')} />
	);

	issueLink.after(prLink);

	const title = select('.codesearch-results h3')!.firstChild!;
	if (/\bis:pr\b/.test(getSearchQuery())) {
		// Update UI in PR searches
		issueLink.classList.remove('selected');
		title.textContent = title.textContent!.replace('issue', 'pull request');
	} else if (/\btype=Issues\b/.test(location.search) && !/\bis:issue\b/.test(getSearchQuery())) {
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
	id: __featureName__,
	description: 'Separates issues from PRs in the global search.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/52181103-35a09f80-2829-11e9-9c6f-57f2e08fc5b2.png',
	include: [
		features.isRepoSearch,
		features.isGlobalSearchResults
	],
	load: features.onAjaxedPages,
	init
});
