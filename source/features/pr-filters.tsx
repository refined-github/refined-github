import React from 'dom-chef';
import select from 'select-dom';
import {checkInline} from '../libs/icons';
import features from '../libs/features';
import {fetchCIStatus} from './ci-link';

let currentQuerySegments: string[];

function addDropdownItem(dropdown: HTMLElement, title: string, filterCategory: string, filterValue: string): void {
	const filterQuery = `${filterCategory}:${filterValue}`;

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
			href={`?${search}`}
			className={`select-menu-item ${isSelected ? 'selected' : ''}`}
			aria-checked={isSelected ? 'true' : 'false'}
			role="menuitemradio"
		>
			{checkInline()}
			<div className="select-menu-item-text">{title}</div>
		</a>
	);
}

function addDraftFilter(reviewsFilter: HTMLElement): void {
	reviewsFilter.addEventListener('toggle', () => {
		const dropdown = select('.select-menu-list', reviewsFilter)!;

		dropdown.append(
			<div className="SelectMenu-divider">
				Filter by draft pull requests
			</div>
		);

		addDropdownItem(dropdown, 'Ready for review', 'draft', 'false');
		addDropdownItem(dropdown, 'Not ready for review (Draft PR)', 'draft', 'true');
	}, {once: true});
}

async function addStatusFilter(reviewsFilter: HTMLElement): Promise<void | false> {
	const hasCI = await fetchCIStatus();

	if (!hasCI) {
		return false;
	}

	// Copy existing element and adapt its content
	const statusFilter = reviewsFilter.cloneNode(true) as HTMLDetailsElement;
	const dropdown = select('.select-menu-list', statusFilter)!;

	select('summary', statusFilter)!.textContent = 'Status\u00A0';
	select('.select-menu-title', statusFilter)!.textContent = 'Filter by build status';
	dropdown.textContent = ''; // Drop previous filters

	statusFilter.addEventListener('toggle', () => {
		for (const status of ['Success', 'Failure', 'Pending']) {
			addDropdownItem(dropdown, status, 'status', status.toLowerCase());
		}
	}, {once: true});
	reviewsFilter.after(statusFilter);
}

async function init(): Promise<void | false> {
	const reviewsFilter = select('.table-list-header-toggle > details:nth-last-child(3)')!;

	if (!reviewsFilter) {
		return false;
	}

	const searchParam = new URLSearchParams(location.search);
	currentQuerySegments = (searchParam.get('q') || '').split(/\s+/);

	addDraftFilter(reviewsFilter);

	return addStatusFilter(reviewsFilter);
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
