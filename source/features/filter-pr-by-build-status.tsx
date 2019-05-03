/**
This feature lets you filter the PRs by their build status, namely success, failure, and pending.
For more information read the GitHub blog: https://github.blog/2015-06-02-filter-pull-requests-by-status/

See it in action at https://github.com/sindresorhus/refined-github/pulls
*/
import React from 'dom-chef';
import select from 'select-dom';
import {checkInline} from '../libs/icons';
import features from '../libs/features';

function populateDropDown({currentTarget}: Event): void {
	const searchParam = new URLSearchParams(location.search);
	let queryString = searchParam.get('q') || '';

	const [, currentStatus = ''] = queryString.match(/\bstatus:(success|failure|pending)\b/) || [];

	if (currentStatus) {
		queryString = queryString.replace(`status:${currentStatus}`, '').trim();
	}

	const dropdown = select('.select-menu-list', currentTarget as Element)!;
	for (const status of ['Success', 'Failure', 'Pending']) {
		const isSelected = currentStatus.toLowerCase() === status.toLowerCase();
		const search = new URLSearchParams({
			q: `${queryString} status:${status.toLowerCase()}`
		});

		dropdown.append(
			<a
				href={`?${search}`}
				className={`select-menu-item ${isSelected ? 'selected' : ''}`}
				aria-checked={isSelected}
				role="menuitemradio"
			>
				{checkInline()}
				<div className="select-menu-item-text">{status}</div>
			</a>
		);
	}
}

function init(): void | false {
	const reviewsFilter = select('.table-list-header-toggle > details:nth-last-child(3)')!;

	if (!reviewsFilter) {
		return false;
	}

	// Copy existing element and adapt its content
	const statusFilter = reviewsFilter.cloneNode(true) as HTMLDetailsElement;
	select('summary', statusFilter)!.textContent = 'Status\u00A0';
	select('.select-menu-title', statusFilter)!.textContent = 'Filter by build status';
	select('.select-menu-list', statusFilter)!.textContent = ''; // Drop previous filters

	statusFilter.addEventListener('toggle', populateDropDown, {once: true});
	reviewsFilter.after(statusFilter);
}

features.add({
	id: 'filter-pr-by-build-status',
	include: [
		features.isPRList
	],
	load: features.onAjaxedPages,
	init
});
