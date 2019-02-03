import {React} from 'dom-chef/react';
import select from 'select-dom';
import features from '../libs/features';

function cleanLinks() {
	for (const link of select.all('.menu-item')) {
		const searchParams = new URLSearchParams(link.search);
		searchParams.set('q', cleanSearchQuery(searchParams.get('q')));
		link.search = searchParams.toString();
	}
}

function getSearchQuery() {
	return new URLSearchParams(location.search).get('q');
}

function cleanSearchQuery(query, newType = '') {
	return query
		.replace(/\bis:(pr|issue)\b/gi, '')
		.replace(/\s{2,}/g, ' ').trim() + ' ' + newType;
}

function createUrl(type, pathname = location.pathname) {
	const url = new URL(pathname, location.origin);
	url.searchParams.set('q', cleanSearchQuery(getSearchQuery(), `is:${type}`));
	url.searchParams.set('type', 'Issues');
	return url.toString();
}

function init() {
	cleanLinks();

	const issueLink = select('nav.menu a[href*="&type=Issues"]');
	issueLink.textContent = 'Issues'; // Drops any possible counter
	issueLink.href = createUrl('issue');
	issueLink.append(
		<include-fragment src={createUrl('issue', location.pathname + '/count')} />
	);

	const prLink = issueLink.cloneNode(true);
	prLink.textContent = 'Pull requests';
	prLink.href = createUrl('pr');
	prLink.append(
		<include-fragment src={createUrl('pr', location.pathname + '/count')} />
	);

	issueLink.after(prLink);

	// Update UI in PR searches
	const title = select('.codesearch-results h3').firstChild;
	if (/\bis:pr\b/.test(getSearchQuery())) {
		issueLink.classList.remove('selected');
		title.textContent = title.textContent.replace('issue', 'pull request');
	} else if (/\btype=Issues\b/.test(location.search) && !/\bis:issue\b/.test(getSearchQuery())) {
		title.textContent = title.textContent
			.replace(/issue\b/, 'issue or pull request')
			.replace(/issues/, 'issues and pull requests');

		// `.selected` overrides `:hover`, so we need to reapply `:hover`'s style
		prLink.classList.add('rgh-split-issue-pr-combined')
		issueLink.classList.add('rgh-split-issue-pr-combined')
	} else {
		prLink.classList.remove('selected');
	}
}

features.add({
	id: 'split-issue-pr-search-results',
	include: [
		features.isRepoSearch,
		features.isGlobalSearchResults
	],
	load: features.onAjaxedPages,
	init
});
