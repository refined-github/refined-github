import {React} from 'dom-chef/react';
import select from 'select-dom';
import features from '../libs/features';
import domify from '../libs/domify';

function cleanLinks(links) {
	for (const link of links) {
		const href = new URL(link.href);
		href.searchParams.set('q', cleanSearchQuery(href.searchParams.get('q')));
		link.href = href;
	}
}

function getSearchQuery() {
	return new URL(location.href).searchParams.get('q');
}

function cleanSearchQuery(query) {
	return query.replace(/\s*\bis:(pr|issue)\b\s*/gi, '');
}

function createUrl(type) {
	const query = cleanSearchQuery(getSearchQuery());
	return `${location.origin}${location.pathname}?q=${encodeURIComponent(query)}+is%3A${type}&type=Issues`;
}

async function fetchCount(type) {
	const response = await fetch(createUrl(type));
	const text = await response.text();
	const counter = domify(text).querySelector('.menu a.selected .Counter');
	return counter ? counter.textContent : 0; // When there are no results, the counter is absent.
}

function prIsActive() {
	return getSearchQuery().split(' ').includes('is:pr');
}

async function init() {
	const menu = select('nav.menu');

	const issueLink = select('a[href*="&type=Issues"]', menu);
	if (!issueLink) { // Stop when issues are not enabled for this repo.
		return;
	}

	const links = select.all('a', menu).filter(item => item !== issueLink);
	cleanLinks(links);

	issueLink.href = createUrl('issue');

	const prUrl = createUrl('pr');
	const prHtml = <a class="menu-item" href={prUrl}>Pull Requests<span class="Counter ml-1 mt-1" data-search-type="PR"></span></a>;
	issueLink.after(prHtml);

	if (prIsActive()) {
		select('.selected', menu).classList.remove('selected');
		prHtml.classList.add('selected');

		const h3 = select('.codesearch-results h3');
		h3.innerHTML = h3.innerHTML.replace(/\bissues\b/gi, 'pull requests');
	}

	const [prCount = 0, issueCount = 0] = await Promise.all([fetchCount('pr'), fetchCount('issue')]);
	const prCounter = select('.Counter', prHtml);
	if (prCounter) { // When there are no results, the counter is absent.
		if (prCount > 0) {
			prCounter.textContent = prCount;
		} else {
			prCounter.parentNode.removeChild(prCounter);
		}
	}

	const issueCounter = select('.Counter', issueLink);
	if (issueCounter) { // When there are no results, the counter is absent.
		if (issueCount > 0) {
			issueCounter.textContent = issueCount;
		} else {
			issueCounter.parentNode.removeChild(issueCounter);
		}
	}
}

features.add({
	id: 'search-results-filter',
	include: [
		features.isRepoSearch
	],
	load: features.onAjaxedPages,
	init
});
