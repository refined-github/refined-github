import React from 'dom-chef';
import select from 'select-dom';
import {checkInline} from '../libs/icons';
import features from '../libs/features';

function init() {
	const statusFilter = select('.table-list-header-toggle > details:nth-last-child(3)').cloneNode(true) as HTMLElement;

	select('summary', statusFilter).textContent = 'Status\xA0';
	select('.select-menu-title', statusFilter).textContent = 'Filter by build status';
	select('.select-menu-list', statusFilter).innerHTML = '';

	select('.table-list-header-toggle > details:nth-last-child(2)').before(statusFilter);
	select('.table-list-header-toggle > details:nth-last-child(3)').addEventListener('toggle', populateDropDown, {once: true});
}

function populateDropDown() {
	const statusList = ['Success', 'Failure', 'Pending'];

	const searchParam = new URLSearchParams(location.search);
	let queryString = searchParam.get('q') || '';

	const [, currentStatus] = queryString.match(/status:(success|failure|pending)/) || [, ''];

	if (currentStatus) {
		queryString = queryString.replace(/status:(success|failure|pending)/g, '').trim();
	}

	select('.table-list-header-toggle > details:nth-last-child(3) .select-menu-list').append(...statusList.map(status => {
		const isSelected = currentStatus.toLowerCase() === status.toLowerCase();

		return (
			<a
				href={`?${new URLSearchParams({q: `${queryString} status:${status.toLowerCase()}`})}`}
				class={`select-menu-item ${isSelected ? 'selected' : ''}`}
				aria-checked={String(isSelected)}
				role="menuitemradio"
			>
				{checkInline()}
				<div class="select-menu-item-text">{status}</div>
			</a>
		);
	}));
}

features.add({
	id: 'filter-pr-by-build-status',
	include: [
		features.isPRList
	],
	load: features.onAjaxedPages,
	init
});
