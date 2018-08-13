/* eslint-disable no-alert */
import {h} from 'dom-chef';
import select from 'select-dom';
import {isIssueList} from '../libs/page-detect';

const confirmationRequiredCount = 10;

function getUrlFromCheckbox(checkbox) {
	return checkbox.closest('li').querySelector('.js-navigation-open').href;
}

function openSelected() {
	const selected = select.all('[name="issues[]"]:checked');
	if (
		selected.length >= confirmationRequiredCount &&
		!confirm(`This will open ${selected.length} new tabs. Continue?`)
	) {
		return;
	}

	browser.runtime.sendMessage({
		urls: selected.map(getUrlFromCheckbox),
		action: 'openAllInTabs'
	});
}

export default function () {
	if (!isIssueList()) {
		return;
	}

	const position = select('.table-list-triage .table-list-header-toggle');
	if (!position) {
		return;
	}
	position.prepend(
		<button
			type="button"
			onClick={openSelected}
			class="float-left btn-link rgh-open-all-selected"
		>
			Open in new tabs
		</button>
	);
}

