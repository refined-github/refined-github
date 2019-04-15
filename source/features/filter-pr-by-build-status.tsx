import React from 'dom-chef';
import select from 'select-dom';
import {checkInline} from '../libs/icons';
import features from '../libs/features';

function init() {
	const filterAssignee = select('.table-list-header-toggle > details:nth-last-child(2)');

	filterAssignee.before(
		<details class="details-reset details-overlay float-left select-menu">
			<summary class="btn-link select-menu-button" aria-haspopup="menu">
				Status&nbsp;
			</summary>
			<details-menu class="select-menu-modal position-absolute right-0" style={{zIndex: 99}} role="menu">
				<div class="select-menu-header">
					<span class="select-menu-title">Filter by Status</span>
				</div>
				<div class="select-menu-list"></div>
			</details-menu>
		</details>
	);

	select('.table-list-header-toggle > details:nth-last-child(3)').addEventListener('toggle', populateDropDown, {once: true});
}

function populateDropDown() {
	const dropDownItems = getStatusDropDownItems();
	const menu = select('.table-list-header-toggle > details:nth-last-child(3) .select-menu-list');

	for (const item of dropDownItems) {
		menu.append(item);
	}
}

const getStatusDropDownItems = () => {
	const statusList = ['Success', 'Failure', 'Pending'];

	const searchParam = new URLSearchParams(location.search);
	let queryString = searchParam.get('q') || 'is:pr is:open';

	const [currentStatus] = queryString.match(/(?<=status:)(success|failure|pending)/) || [undefined];

	if (currentStatus) {
		queryString = queryString.replace(/status:(success|failure|pending)/g, '').trim();
	}

	return statusList.map(status => {
		const isSelected = currentStatus ? currentStatus.toLowerCase() === status.toLowerCase() : false;

		return (
			<a
				href={`?${String(new URLSearchParams({q: queryString + ` status:${status.toLowerCase()}`}))}`}
				class={`select-menu-item ${isSelected ? 'selected' : ''}`}
				aria-checked={isSelected ? 'true' : 'false'}
				role="menuitemradio"
			>
				{checkInline()}
				<div class="select-menu-item-text">{status}</div>
			</a>
		);
	});
};

features.add({
	id: 'filter-pr-by-build-status',
	include: [
		features.isPRList
	],
	load: features.onAjaxedPages,
	init
});
