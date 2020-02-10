import React from 'dom-chef';
import select from 'select-dom';
import delegate, {DelegateEvent} from 'delegate-it';
import checkIcon from 'octicon/check.svg';
import features from '../libs/features';
import {getIcon as fetchCIStatus} from './ci-link';

const reviewsFilterSelector = '#reviews-select-menu';

function addDropdownItem(dropdown: HTMLElement, title: string, filterCategory: string, filterValue: string): void {
	const filterQuery = `${filterCategory}:${filterValue}`;

	const searchParameter = new URLSearchParams(location.search);
	const currentQuerySegments = searchParameter.get('q')?.split(/\s+/) ?? [];
	const isSelected = currentQuerySegments.some(
		segment => segment.toLowerCase() === filterQuery
	);

	const query = currentQuerySegments.filter(
		segment => !segment.startsWith(`${filterCategory}:`)
	).join(' ');

	const search = new URLSearchParams({
		q: query + (isSelected ? '' : ` ${filterQuery}`)
	});

	const icon = checkIcon();
	icon.classList.add('SelectMenu-icon', 'SelectMenu-icon--check');

	dropdown.append(
		<a
			href={`?${String(search)}`}
			className="SelectMenu-item"
			aria-checked={isSelected ? 'true' : 'false'}
			role="menuitemradio"
		>
			{icon}
			<span>{title}</span>
		</a>
	);
}

const hasDraftFilter = new WeakSet();
function addDraftFilter({delegateTarget: reviewsFilter}: DelegateEvent): void {
	if (hasDraftFilter.has(reviewsFilter)) {
		return;
	}

	hasDraftFilter.add(reviewsFilter);

	const dropdown = select('.SelectMenu-list', reviewsFilter)!;

	dropdown.append(
		<div className="SelectMenu-divider">
			Filter by draft pull requests
		</div>
	);

	addDropdownItem(dropdown, 'Ready for review', 'draft', 'false');
	addDropdownItem(dropdown, 'Not ready for review (Draft PR)', 'draft', 'true');
}

async function addStatusFilter(): Promise<void> {
	const reviewsFilter = select(reviewsFilterSelector);
	if (!reviewsFilter) {
		return;
	}

	// TODO: replace this with an API call
	const hasCI = await fetchCIStatus();
	if (!hasCI) {
		return;
	}

	// Copy existing element and adapt its content
	const statusFilter = reviewsFilter.cloneNode(true);
	statusFilter.id = '';

	select('summary', statusFilter)!.firstChild!.textContent = 'Status\u00A0'; // Only replace text node, keep caret
	select('.SelectMenu-title', statusFilter)!.textContent = 'Filter by build status';

	const dropdown = select('.SelectMenu-list', statusFilter)!;
	dropdown.textContent = ''; // Drop previous filters

	for (const status of ['Success', 'Failure', 'Pending']) {
		addDropdownItem(dropdown, status, 'status', status.toLowerCase());
	}

	reviewsFilter.after(' ', statusFilter);
}

function init(): void {
	delegate(reviewsFilterSelector, 'toggle', addDraftFilter, true);
	addStatusFilter();
}

features.add({
	id: __featureName__,
	description: 'Adds `Build status` and draft PR dropdown filters in PR lists.',
	screenshot: 'https://user-images.githubusercontent.com/22439276/56372372-7733ca80-621c-11e9-8b60-a0b95aa4cd4f.png',
	include: [
		features.isPRList
	],
	load: features.onAjaxedPages,
	init
});
