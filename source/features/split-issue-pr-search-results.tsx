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
	prLink.classList.remove('selected');

	issueLink.after(prLink);

	// Update UI in PR searches
	if (/\bis:pr\b/.test(getSearchQuery())) {
		select('.menu-item.selected').classList.remove('selected');
		prLink.classList.add('selected');

		const title = select('.codesearch-results h3').firstChild;
		title.textContent = title.textContent.replace('issue', 'pull request');
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
