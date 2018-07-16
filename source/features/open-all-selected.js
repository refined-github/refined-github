/* eslint-disable no-alert */
import {h} from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from '../libs/page-detect';

const confirmationRequiredCount = 10;

function getUrlFromCheckbox(checkbox) {
	return checkbox.closest('li').querySelector('.js-navigation-open').href;
}

function openSelected(all = false) {
	const links = all === true ? '.link-gray-dark' : '[name="issues[]"]:checked';
	const selected = select.all(links);

	if (
		selected.length >= confirmationRequiredCount &&
		!confirm(`This will open ${selected.length} new tabs. Continue?`)
	) {
		return;
	}

	browser.runtime.sendMessage({
		urls: all ? selected.map(e => {
			return e.href;
		}) : selected.map(getUrlFromCheckbox),
		action: 'openAllInTabs'
	});
}

export default function () {
	if (!pageDetect.isIssueList()) {
		return;
	}

	const allItemsButtonPosition = select('.table-list-header .table-list-header-toggle:not(.states)');
	const selectedItemsButtonPosition = select('.table-list-triage .table-list-header-toggle');
	const openAllButtonText = location.pathname.endsWith('/issues') ? `Open all issues` : `Open all PRs`;

	if (allItemsButtonPosition && select.all('.link-gray-dark').length !== 0) {
		allItemsButtonPosition.prepend(
			<button
				type="button"
				onClick={openSelected.bind(null, true)}
				class="float-left btn-link rgh-open-all-selected"
			>
				{openAllButtonText}
			</button>
		);
		selectedItemsButtonPosition.prepend(
			<button
				type="button"
				onClick={openSelected}
				class="float-left btn-link rgh-open-all-selected"
			>
				Open in new tabs
			</button>
		);
	}
}

