import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import CheckIcon from 'octicons-plain-react/Check';
import {$} from 'select-dom';
import {CachedFunction} from 'webext-storage-cache';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import {cacheByRepo} from '../github-helpers/index.js';
import SearchQuery from '../github-helpers/search-query.js';
import observe from '../helpers/selector-observer.js';
import HasChecks from './pr-filters.gql';

const reviewsFilterSelector = '#reviews-select-menu';

function getFilterLink(filterCategory: string, filterValue: string): {href: string; isSelected: boolean} {
	const filterQuery = `${filterCategory}:${filterValue}`;

	const searchQuery = SearchQuery.from(location);
	const isSelected = searchQuery.includes(filterQuery);

	const filtersToRemove = searchQuery.getQueryParts().filter(part => part.startsWith(`${filterCategory}:`));
	searchQuery.remove(...filtersToRemove);

	if (!isSelected) {
		searchQuery.append(filterQuery);
	}

	return {href: searchQuery.href, isSelected};
}

function addDropdownItem(dropdown: HTMLElement, title: string, filterCategory: string, filterValue: string): void {
	const {href, isSelected} = getFilterLink(filterCategory, filterValue);

	dropdown.append(
		<a
			href={href}
			className="SelectMenu-item"
			aria-checked={isSelected ? 'true' : 'false'}
			role="menuitemradio"
		>
			<CheckIcon className="SelectMenu-icon SelectMenu-icon--check" />
			<span>{title}</span>
		</a>,
	);
}

function addDraftFilter(dropdown: HTMLElement): void {
	dropdown.append(
		<div className="SelectMenu-divider">
			Filter by draft pull requests
		</div>,
	);

	addDropdownItem(dropdown, 'Ready for review', 'draft', 'false');
	addDropdownItem(dropdown, 'Not ready for review (Draft PR)', 'draft', 'true');
}

const hasChecks = new CachedFunction('has-checks', {
	async updater(): Promise<boolean> {
		const {repository} = await api.v4(HasChecks);

		return repository.head.history.nodes.some((commit: AnyObject) => commit.statusCheckRollup);
	},
	maxAge: {days: 3},
	cacheKey: cacheByRepo,
});

async function addChecksFilter(reviewsFilter: HTMLElement): Promise<void> {
	if (!await hasChecks.get()) {
		return;
	}

	// Copy existing element and adapt its content
	const checksFilter = reviewsFilter.cloneNode(true);
	checksFilter.id = '';

	$('summary', checksFilter).firstChild!.textContent = 'Checks\u{A0}'; // Only replace text node, keep caret
	$('.SelectMenu-title', checksFilter).textContent = 'Filter by checks status';

	const dropdown = $('.SelectMenu-list', checksFilter);
	dropdown.textContent = ''; // Drop previous filters

	for (const status of ['Success', 'Failure', 'Pending']) {
		addDropdownItem(dropdown, status, 'status', status.toLowerCase());
	}

	reviewsFilter.after(checksFilter);
}

// The React menu is rendered on open, so clone one of its items to match its styles
function addReactDraftFilter(menu: HTMLElement): void {
	const button = document.getElementById(menu.getAttribute('aria-labelledby')!);
	if (button!.getAttribute('aria-label') !== 'Filter by reviews') {
		return;
	}

	const template = $('li', menu);

	for (const [title, value] of [['Ready for review', 'false'], ['Not ready for review (Draft PR)', 'true']]) {
		const {href, isSelected} = getFilterLink('draft', value);
		const item = template.cloneNode(true);
		item.removeAttribute('id');
		item.removeAttribute('aria-labelledby');
		item.removeAttribute('aria-keyshortcuts');
		item.tabIndex = -1;
		item.ariaChecked = String(isSelected);

		const label = $('[data-component="ActionList.Item.Label"]', item);
		label.removeAttribute('id');
		label.textContent = title;

		// Cloning drops React's handlers
		item.addEventListener('click', () => {
			location.assign(href);
		});
		item.addEventListener('keydown', event => {
			if (event.key !== 'Enter' && event.key !== ' ') {
				return;
			}

			event.preventDefault();
			location.assign(href);
		});
		menu.append(item);
	}
}

async function init(signal: AbortSignal): Promise<void> {
	observe('[role="menu"][aria-labelledby]', addReactDraftFilter, {signal});
	observe(reviewsFilterSelector, addChecksFilter, {signal});
	observe(`${reviewsFilterSelector} .SelectMenu-list`, addDraftFilter, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRList,
	],
	requiresToken: true,
	init,
});

/*

Test URLs:

https://github.com/pulls
https://github.com/refined-github/refined-github/pulls

*/
