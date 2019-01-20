/* eslint-disable no-alert */
import {React} from 'dom-chef/react';
import select from 'select-dom';
import features from '../libs/features';

const confirmationRequiredCount = 10;

function getUrlFromItem(checkbox) {
	return checkbox.closest('.js-issue-row').querySelector('.js-navigation-open').href;
}

function openIssues() {
	const issues = select.all([
		'#js-issues-toolbar.triage-mode + div [name="issues[]"]:checked', // Get checked checkboxes
		'#js-issues-toolbar:not(.triage-mode) + div .js-issue-row' // Or all items
	].join(','));

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

function init() {
	if (select.all('.js-issue-row').length < 2) {
		return false;
	}

	const filtersBar = select('.table-list-header .table-list-header-toggle:not(.states)');
	if (filtersBar) {
		filtersBar.prepend(
			<button
				type="button"
				onClick={openIssues}
				class="float-left btn-link rgh-open-all-selected"
			>
				Open All
			</button>
		);
	}

	const triageFiltersBar = select('.table-list-triage .table-list-header-toggle');
	if (triageFiltersBar) {
		triageFiltersBar.prepend(
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

features.add({
	id: 'batch-open-issues',
	include: [
		features.isGlobalIssueSearch,
		features.isGlobalPRSearch,
		features.isIssueList
	],
	load: features.onAjaxedPages,
	init
});
