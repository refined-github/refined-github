import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';

function cleanLinks() {
	for (const link of select.all<HTMLAnchorElement>('.menu-item')) {
		const searchParams = new URLSearchParams(link.search);
		searchParams.set('q', cleanSearchQuery(searchParams.get('q')));
		link.search = String(searchParams);
	}
}

function getSearchQuery() {
	return new URLSearchParams(location.search).get('q');
}

function cleanSearchQuery(query) {
	return query
		.replace(/\bis:(pr|issue)\b/gi, '')
		.replace(/\s{2,}/g, ' ').trim();
}

function createUrl(type, pathname = location.pathname) {
	const url = new URL(pathname, location.origin);
	url.searchParams.set('q', cleanSearchQuery(getSearchQuery()) + ` is:${type}`);
	url.searchParams.set('type', 'Issues');
	return String(url);
}

function init() {
	cleanLinks();

	const issueLink = select<HTMLAnchorElement>('nav.menu a[href*="&type=Issues"]');
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

	const title = select('.codesearch-results h3').firstChild;
	if (/\bis:pr\b/.test(getSearchQuery())) {
		// Update UI in PR searches
		issueLink.classList.remove('selected');
		title.textContent = title.textContent.replace('issue', 'pull request');
	} else if (/\btype=Issues\b/.test(location.search) && !/\bis:issue\b/.test(getSearchQuery())) {
		// Update UI in combined searches (where there's no `is:<type>` query)
		title.textContent = title.textContent
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
	id: 'split-issue-pr-search-results',
	description: 'Search for issues and PRs separately in the top search',
	include: [
		features.isRepoSearch,
		features.isGlobalSearchResults
	],
	load: features.onAjaxedPages,
	init
});
