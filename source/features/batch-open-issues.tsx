import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import features from '../libs/features';

const confirmationRequiredCount = 10;

function getUrlFromItem(checkbox: Element): string {
	return checkbox
		.closest('.js-issue-row')!
		.querySelector<HTMLAnchorElement>('.js-navigation-open')!
		.href;
}

function openIssues(): void {
	const modifier = features.isGlobalDiscussionList() ? '' : ' + div ';
	const issues = select.all([
		`#js-issues-toolbar.triage-mode ${modifier} [name="issues[]"]:checked`, // Get checked checkboxes
		`#js-issues-toolbar:not(.triage-mode) ${modifier} .js-issue-row` // Or all items
	]);

	if (
		issues.length >= confirmationRequiredCount &&
		!confirm(`This will open ${issues.length} new tabs. Continue?`)
	) {
		return;
	}

	browser.runtime.sendMessage({
		openUrls: issues.map(getUrlFromItem)
	});
}

function init(): void | false {
	if (select.all('.js-issue-row').length < 2) {
		return false;
	}

	delegate('.rgh-batch-open-issues', 'click', openIssues);

	const filtersBar = select('.table-list-header-toggle:not(.states)');
	if (filtersBar) {
		filtersBar.prepend(
			<button
				type="button"
				className="btn-link rgh-batch-open-issues pr-2"
			>
				Open All
			</button>
		);
	}

	const triageFiltersBar = select('.table-list-triage > .text-gray');
	if (triageFiltersBar) {
		triageFiltersBar.classList.add('table-list-header-toggle'); // Handles link :hover style
		triageFiltersBar.append(
			<button
				type="button"
				className="btn-link rgh-batch-open-issues pl-3"
			>
				Open all
			</button>
		);
	}
}

features.add({
	id: __featureName__,
	description: 'Adds a button to open multiple discussions at once in your repos.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/38084752-4820b0d8-3378-11e8-868c-a1582b16f915.gif',
	include: [
		features.isDiscussionList
	],
	load: features.onAjaxedPages,
	init
});
