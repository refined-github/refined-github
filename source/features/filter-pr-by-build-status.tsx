import React from 'dom-chef';
import select from 'select-dom';
import {checkInline} from '../libs/icons';
import features from '../libs/features';
import {getOwnerAndRepo} from '../libs/utils';

function init() {
	const filterAssignee = select('.table-list-filters > .table-list-header-toggle:last-child > details:nth-child(7)');

	filterAssignee.parentNode.insertBefore(
		<details class="details-reset details-overlay float-left select-menu">
			<summary class="btn-link select-menu-button" aria-haspopup="menu">
				Status&nbsp;
			</summary>
			<details-menu class="select-menu-modal position-absolute right-0" style={{zIndex: 99}} role="menu">
				<div class="select-menu-header">
					<span class="select-menu-title">Filter by Status</span>
				</div>
				<div class="select-menu-list">
					{getStatusDropDown()}
				</div>
			</details-menu>
		</details>,
		filterAssignee
	);
}

const getStatusDropDown = () => {
	const {ownerName, repoName} = getOwnerAndRepo();
	const baseUrl = `https://github.com/${ownerName}/${repoName}/pulls`;

	const statusList = ['Success', 'Failure', 'Pending'];

	let existingFilter = select<HTMLInputElement>('#js-issues-search').value
		.trim()
		.replace(/\s+/, ' ');

	const [currentStatus = ''] = existingFilter.match(/(?<=status:)(success|failure|pending)/) || [];

	if (currentStatus) {
		existingFilter = existingFilter.replace(/status:(success|failure|pending)/g, '').trim();
	}

	const encodedUrl = existingFilter.split(' ').map(str => encodeURIComponent(str)).join('+');

	const existingUrl = `${baseUrl}?q=${encodedUrl}`;

	return statusList.map(status => {
		const isSelected = currentStatus.toLowerCase() === status.toLowerCase();

		return (
			<a
				href={`${existingUrl}+status%3A${status.toLowerCase()}`}
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
	include: [features.isPRList],
	load: features.onAjaxedPages,
	init
});
