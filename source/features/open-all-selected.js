/* eslint-disable no-alert */
import {h} from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from '../libs/page-detect';

const confirmationRequiredCount = 10;

function getUrlFromItem(element) {
	// Element could be a checkbox or the issue's <li>
	return element.closest('li').querySelector('.js-navigation-open').href;
}

function openIssues() {
	const issues = select.all([
		'#js-issues-toolbar.triage-mode + div [name="issues[]"]:checked', // Get checked checkboxes
		'#js-issues-toolbar:not(.triage-mode) + div .js-issue-row' // Or all items
	]);

	if (
		issues.length >= confirmationRequiredCount &&
		!confirm(`This will open ${issues.length} new tabs. Continue?`)
	) {
		return;
	}

	browser.runtime.sendMessage({
		urls: issues.map(getUrlFromItem),
		action: 'openAllInTabs'
	});
}

export default function () {
	if (!pageDetect.isIssueList()) {
		return;
	}

	const allItemsButtonPosition = select('.table-list-header .table-list-header-toggle:not(.states)');
	const selectedItemsButtonPosition = select('.table-list-triage .table-list-header-toggle');
	const openAllButtonText = pageDetect.isIssueSearch() ? `Open all issues` : `Open all PRs`;

	if ((allItemsButtonPosition && select.all('.link-gray-dark').length === 0) || selectedItemsButtonPosition) {
		allItemsButtonPosition.prepend(
			<button
				type="button"
				onClick={openIssues}
				class="float-left btn-link rgh-open-all-selected"
			>
				{openAllButtonText}
			</button>
		);
		selectedItemsButtonPosition.prepend(
			<button
				type="button"
				onClick={openIssues}
				class="float-left btn-link rgh-open-all-selected"
			>
				Open in new tabs
			</button>
		);
	}
}

