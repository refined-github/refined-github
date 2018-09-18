/*
This feature ...
*/

import {h} from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate';

const qualifier = [
	'author',
	'assignee',
	'label',
	'review',
	'reviewed-by'
];

// TODO: We guess the last qualifier is the right one
// This might not be always correct, specifically other features could influence this
// Also if e.g. two labels are selected the alt clicking would remove it and negate the other one
// To solve this we would need to parse the item to see what filter it would build
const lastQualifier = new RegExp(`((?:${qualifier.join('|')}):[^:]+)$`);

const negateSearch = item => {
	const search = new URLSearchParams(item.search);
	const q = search.get('q') || '';
	const negated = q.replace(lastQualifier, '-$1');
	search.set('q', negated);
	return search;
};

export default function () {
	const onItemClicked = event => {
		if (!event.altKey) {
			return;
		}

		const item = event.delegateTarget;
		const negatedSearch = negateSearch(item);
		// NOTE: We don't need to handle the click if we didn't change the url
		if (item.search === negatedSearch) {
			return;
		}

		event.preventDefault();
		item.search = negatedSearch;
		item.click();
	};

	const base = select('.table-list-filters');
	delegate(base, 'a.select-menu-item', 'click', onItemClicked, false);
}
