/**
 * This feature lets you filter the PRs by their build status namely success, failure and pending.
 * For more information read the GitHub blog https://github.blog/2015-06-02-filter-pull-requests-by-status/
 *
 * See it in action at https://github.com/sindresorhus/refined-github/pulls
 */
import React from 'dom-chef';
import select from 'select-dom';
import {checkInline} from '../libs/icons';
import features from '../libs/features';

function init() {
	const statusFilter = select<HTMLDetailsElement>('.table-list-header-toggle > details:nth-last-child(3)')!.cloneNode(true) as HTMLDetailsElement;

	select('summary', statusFilter)!.textContent = 'Status\u00A0';
	select('.select-menu-title', statusFilter)!.textContent = 'Filter by build status';
	select('.select-menu-list', statusFilter)!.innerHTML = '';

	select('.table-list-header-toggle > details:nth-last-child(2)')!.before(statusFilter);
	select('.table-list-header-toggle > details:nth-last-child(3)')!.addEventListener('toggle', populateDropDown, {once: true});
}

function populateDropDown() {
	const statusList = ['Success', 'Failure', 'Pending'];

	const searchParam = new URLSearchParams(location.search);
	let queryString = searchParam.get('q') || '';

	const [, currentStatus = ''] = queryString.match(/\bstatus:(success|failure|pending)\b/) || [];

	if (currentStatus) {
		queryString = queryString.replace(/\bstatus:(success|failure|pending)\b/g, '').trim();
	}

	select('.table-list-header-toggle > details:nth-last-child(3) .select-menu-list')!.append(...statusList.map(status => {
		const isSelected = currentStatus.toLowerCase() === status.toLowerCase();

		return (
			<a
				href={`?${new URLSearchParams({q: `${queryString} status:${status.toLowerCase()}`})}`}
				className={`select-menu-item ${isSelected ? 'selected' : ''}`}
				aria-checked={isSelected}
				role="menuitemradio"
			>
				{checkInline()}
				<div className="select-menu-item-text">{status}</div>
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
