import React from 'dom-chef';
import select from 'select-dom';
import delegate, {DelegateEvent} from 'delegate-it';
import checkIcon from 'octicon/check.svg';
import features from '../libs/features';
import {getIcon as fetchCIStatus} from './ci-link';

// The Reviews dropdown doesn't have a specific class, so we expect this sequence (span contains Projects and Milestones)
const reviewsFilterSelector = '#label-select-menu + span + details';

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

	dropdown.append(
		<a
			href={`?${String(search)}`}
			className={`select-menu-item ${isSelected ? 'selected' : ''}`}
			aria-checked={isSelected ? 'true' : 'false'}
			role="menuitemradio"
		>
			<span className="select-menu-item-icon">{checkIcon()}</span>
			<div className="select-menu-item-text">{title}</div>
		</a>
	);
}

const hasDraftFilter = new WeakSet();
function addDraftFilter({delegateTarget: reviewsFilter}: DelegateEvent): void {
	if (hasDraftFilter.has(reviewsFilter)) {
		return;
	}

	hasDraftFilter.add(reviewsFilter);

	const dropdown = select('.select-menu-list', reviewsFilter)!;

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
	const dropdown = select('.select-menu-list', statusFilter)!;

	select('summary', statusFilter)!.textContent = 'Status\u00A0';
	select('.select-menu-title', statusFilter)!.textContent = 'Filter by build status';
	dropdown.textContent = ''; // Drop previous filters

	for (const status of ['Success', 'Failure', 'Pending']) {
		addDropdownItem(dropdown, status, 'status', status.toLowerCase());
	}

	reviewsFilter.after(statusFilter);
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
