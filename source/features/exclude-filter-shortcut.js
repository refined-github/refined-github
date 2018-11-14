/*
This feature ...
*/

import {h} from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate';
import {getUsername} from '../libs/utils';

const FILTER_FIELD_MAP = {
	author: 'author',
	label: 'label',
	// NOTE: Doesn't work because it uses the project id
	// projects: 'projects',
	milestones: 'milestone',
	assigns: 'assignee'
};

const getFilterField = item => {
	const filter = item.parentElement.getAttribute('data-filterable-for') || '';
	const name = filter.replace('-filter-field', '');
	return FILTER_FIELD_MAP[name];
};

// NOTE: All filter text that contains a space will be wrapped with double quotes
const normalizeText = text => {
	const normalized = text.trim();
	return normalized.includes(' ') ? `"${normalized}"` : normalized;
};

const getFilter = item => {
	const field = getFilterField(item);
	if (!field) {
		return;
	}

	const itemText = select('.select-menu-item-text', item);
	if (!itemText) {
		return;
	}

	if (field === 'label') {
		const name = select('.name', itemText);
		const text = normalizeText(name.textContent);
		return `label:${text}`;
	}

	// NOTE: This worked for all tested filter fields
	const first = itemText.childNodes[0];
	const text = normalizeText(first.textContent);
	if (field) {
		return `${field}:${text}`;
	}

	// NOTE: Speciall cases
	if (text === 'Reviewed by you') {
		return `reviewed-by:${getUsername()}`;
	}
};

const buildSearch = item => {
	const filter = getFilter(item);
	if (!filter) {
		return;
	}

	const search = new URLSearchParams(location.search);
	const q = search.get('q');
	if (!q) {
		return;
	}

	const query = q.trim();
	const negated = `-${filter}`;
	if (query.includes(negated)) {
		// If -label:bug is there, drop it (to match the regular click behavior)
		search.set('q', query.replace(negated, ' ').replace(/ {2,}/, ' ').trim());
	} else if (query.includes(filter)) {
		// If label:bug is there, replace it with -label:bug
		search.set('q', query.replace(filter, negated));
	} else {
		// If label:bug isn't there, add -label:bug
		search.set('q', `${query} ${negated}`);
	}

	return search;
};

export default function () {
	const onItemClicked = event => {
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

	delegate('.table-list-filters', 'a.select-menu-item', 'click', onItemClicked, false);
}
