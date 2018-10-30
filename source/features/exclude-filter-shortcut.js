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

	const search = new URLSearchParams(item.search);
	const query = search.get('q') || '';

	// NOTE: The item search will not contain the filter even if the negated filter is set
	// TODO: We don't set the negated filter if the non negated filter is already set
	const negated = query.replace(filter, `-${filter}`);
	search.set('q', negated);

	return search;
};

export default function () {
	const onItemClicked = event => {
		if (!event.altKey) {
			return;
		}

		const item = event.delegateTarget;
		const search = buildSearch(item);
		if (!search) {
			return;
		}

		event.preventDefault();
		item.search = search;
		item.click();
	};

	delegate('.table-list-filters', 'a.select-menu-item', 'click', onItemClicked, false);
}
