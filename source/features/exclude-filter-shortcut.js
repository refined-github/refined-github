/*
Exclude PR/issue filters from their list with <kbd>alt</kbd> <kbd>click</kbd>.
https://user-images.githubusercontent.com/1402241/48470535-493cfb00-e824-11e8-863a-964f52b62553.png
*/

import {h} from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate';
import * as icons from '../libs/icons';

const getFilterName = item => {
	return item
		.closest('details')
		.querySelector('summary')
		.textContent
		.trim()
		.replace(/s$/, '') // 'Assignees' -> 'Assignee'; 'Milestones -> Milestone'
		.toLowerCase();
};

const getItemName = item => {
	const itemText = select('.name', item) || select('.select-menu-item-text', item);
	const text = itemText.firstChild.textContent.trim();
	return text.includes(' ') ? `"${text}"` : text;
};

const getLastQuery = item => {
	return new URLSearchParams(item.search)
		.get('q')

		// Get the last query
		.split(' ')
		.pop();
};

const getItemQuery = item => {
	const filter = getFilterName(item);
	if (filter === 'sort') {
		return;
	}
	if (filter === 'review') {
		// Review filters have the review query set even if they’re selected
		return getLastQuery(item);
	}
	if (filter === 'project') {
		// Project filters don’t have the project query set if they’re selected
		// and the query cannot be determined via getFilterName/getItemName
		const query = getLastQuery(item);
		if (query.startsWith('project:')) {
			return query;
		}
		return; // Not supported
	}

	const name = getItemName(item);
	if (name) {
		return `${filter}:${name}`;
	}
	// "No label/milestone/etc" filters won't have a name here and can't be excluded
};

const buildSearch = item => {
	const itemQuery = getItemQuery(item);
	if (!itemQuery) {
		return;
	}

	const search = new URLSearchParams(location.search);
	const currentQuery = (search.get('q') || '').trim();
	const negatedQuery = `-${itemQuery}`;
	if (currentQuery.includes(negatedQuery)) {
		// If -label:bug is there, drop it (to match the regular click behavior)
		search.set('q', currentQuery.replace(negatedQuery, ' ').replace(/ {2,}/, ' ').trim());
	} else if (currentQuery.includes(itemQuery)) {
		// If label:bug is there, replace it with -label:bug
		search.set('q', currentQuery.replace(itemQuery, negatedQuery));
	} else {
		// If label:bug isn't there, add -label:bug
		search.set('q', `${currentQuery} ${negatedQuery}`);
	}

	return search;
};

const visitNegatedQuery = event => {
	if (!event.altKey) {
		return;
	}

	// Avoid the default (downloading the link)
	// even if the link isn't supported
	// because we never want to download pages
	event.preventDefault();
	const item = event.delegateTarget;
	const search = buildSearch(item);
	if (search) {
		item.search = search;
	}

	item.click();
};

const getIcon = isNegated => {
	return <span class="select-menu-item-icon">{isNegated ? icons.x() : icons.check()}</span>;
};

const updateFilterIcons = () => {
	const search = new URLSearchParams(location.search);
	const queries = (search.get('q') || '')
		.trim()
		.match(/(".*?"|[^"\s]+)+(?=\s*|\s*$)/g) || []; // Split by query, exclude spaces in quotes https://stackoverflow.com/a/16261693/288906

	const links = new Map();
	for (const link of select.all('.table-list-filters .select-menu-item:not(.rgh-exclude-filter-icon)')) {
		link.classList.add('rgh-exclude-filter-icon');

		const filter = getItemQuery(link);
		if (filter) {
			links.set(filter, link);
		}
	}
	if (links.size === 0) {
		return;
	}
	for (const query of queries) {
		const isNegated = query[0] === '-';
		const plainQuery = query.replace(/^-/, '');
		const link = links.get(plainQuery);
		if (!link) {
			continue;
		}
		const icon = link.querySelector('.octicon-check');
		if (!icon) {
			link.prepend(getIcon(isNegated));
		} else if (isNegated) {
			icon.replaceWith(getIcon(isNegated));
		}
		link.setAttribute('aria-checked', 'true'); // Necessary for Assignees, but also the correct thing to do
	}
};

export default function () {
	delegate('.table-list-filters', 'a.select-menu-item', 'click', visitNegatedQuery, false);

	updateFilterIcons();

	// Some filters are loaded on demand
	const observer = new MutationObserver(updateFilterIcons);
	for (const dropdown of select.all('.table-list-filters details-menu')) {
		observer.observe(dropdown, {childList: true});
	}
}
