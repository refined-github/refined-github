import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';

const confirmationRequiredCount = 10;

function getUrlFromItem(checkbox: Element): string {
	return checkbox
		.closest('.js-issue-row')!
		.querySelector<HTMLAnchorElement>('.js-navigation-open')!
		.href;
}

function openIssues(): void {
	const modifier = pageDetect.isGlobalConversationList() ? '' : ' + div ';
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

	void browser.runtime.sendMessage({
		openUrls: issues.map(getUrlFromItem)
	});
}

interface IssueConfig {
	number: string;
	prependAt: Element;
}

function getIssueConfig(prRow: Element): IssueConfig {
	let match = prRow.id.match(/^issue_(\d*)$/);
	const number: string = match?.[1] ?? '';
	return {
		number,
		prependAt: prRow.children[0]!,
	};
}


async function init(): Promise<void | false> {
	if (!await elementReady('.js-issue-row + .js-issue-row')) {
		return false;
	}

	delegate(document, '.rgh-batch-open-issues', 'click', openIssues);

	// Add button to open all visible conversations
	select('.table-list-header-toggle:not(.states)')?.prepend(
		<button
			type="button"
			className="btn-link rgh-batch-open-issues px-2"
		>
			Open all
		</button>
	);

	// Add button to open selected conversations
	const triageFiltersBar = select('.table-list-triage > .text-gray');
	if (triageFiltersBar) {
		triageFiltersBar.classList.add('table-list-header-toggle'); // Handles link :hover style
		triageFiltersBar.append(
			<button
				type="button"
				className="btn-link rgh-batch-open-issues pl-3"
			>
				Open selected
			</button>
		);
	} else {
		select('#js-issues-toolbar')?.prepend(
			<div className="mr-3 d-none d-md-block">
  			<input type="checkbox" data-check-all="" aria-label="Select all issues" autoComplete="off"/>
		  </div>
		);
		select('#js-issues-toolbar')?.append(
			<div className="table-list-triage flex-auto js-issues-toolbar-triage">
				<span className="text-gray table-list-header-toggle">
					<span data-check-all-count="">1</span> selected
					<button type="button" className="btn-link rgh-batch-open-issues pl-3">Open selected</button>
				</span>
			</div>
		);

		const prElements = select.all('.js-issue-row');
		const prs = prElements.map(getIssueConfig);

		for (const pr of prs) {
			pr.prependAt.prepend(
				<label class="flex-shrink-0 py-2 pl-3  d-none d-md-block">
					<input
						type="checkbox"
						data-check-all-item=""
						className="js-issues-list-check"
						name="issues[]"
						value={pr.number}
						aria-labelledby={`issue_${pr.number}_link`}
						autoComplete="off" />
				</label>
			);
		}
	}
}

void features.add({
	id: __filebasename,
	description: 'Adds a button to open multiple conversations at once.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/38084752-4820b0d8-3378-11e8-868c-a1582b16f915.gif'
}, {
	include: [
		pageDetect.isConversationList
	],
	waitForDomReady: false,
	init
});
