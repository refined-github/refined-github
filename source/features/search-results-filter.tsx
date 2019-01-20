import {React} from 'dom-chef/react';
import select from 'select-dom';
import features from '../libs/features';
import domify from '../libs/domify';

function getSearchQuery() {
	const url = new URL(location.href);
	const query = url.searchParams.get('q');
	return query;
}

function createUrl(type) {
	const query = getSearchQuery().replace(/\s?is:pr/gi, '').replace(/\s?is:issue/gi, '');
	const url = `${location.origin}${location.pathname}?q=${encodeURIComponent(query)}+is%3A${type}&type=Issues`;
	return url;
}

async function fetchCount(type) {
	const url = createUrl(type);
	const response = await fetch(url, {credentials: 'same-origin'});
	const text = await response.text();
	const dom = domify(text);
	const el = dom.querySelector('.menu a.selected .Counter');
	const val = el.textContent;
	const c = parseInt(val, 10);
	return c;
}

async function init() {
	const menu = select('nav.menu');
	for (const link of select.all('a:not([href*="&type=Issues"])', menu)) {
		link.href = link.href.replace(/\+?is%3Apr/gi, '').replace(/\+?is%3Aissue/gi, '');
	}

	const issuesLink = select('a[href*="&type=Issues"]', menu);
	if (!issuesLink) { // Stop when issues are not enabled for this repo.
		return;
	}

	issuesLink.href = createUrl('issue');

	const prUrl = createUrl('pr');
	const prHtml = <a class="menu-item" href={prUrl}>PR<span class="Counter ml-1 mt-1" data-search-type="PR"></span></a>;
	issuesLink.after(prHtml);
	if (getSearchQuery().includes('is:pr')) {
		select('.selected', menu).classList.remove('selected');
		prHtml.classList.add('selected');
	}

	select('.Counter', prHtml).textContent = await fetchCount('pr');
	select('.Counter', issuesLink).textContent = await fetchCount('issue');
}

features.add({
	id: 'search-results-filter',
	include: [
		features.isRepoSearch
	],
	load: features.onAjaxedPages,
	init
});
