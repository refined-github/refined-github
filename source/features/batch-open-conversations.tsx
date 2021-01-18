import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import domLoaded from 'dom-loaded';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import looseParseInt from '../helpers/loose-parse-int';

const confirmationRequiredCount = 10;

function getUrlFromItem(checkbox: Element): string {
	return checkbox
		.closest('.js-issue-row')!
		.querySelector('a.js-navigation-open')!
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

async function init(): Promise<void | false> {
	if (!await elementReady('.js-issue-row + .js-issue-row', {waitForChildren: false})) {
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
	} else if (!pageDetect.isEnterprise() && pageDetect.isRepoConversationList()) { // Enterprise has the pre-"Repository refresh" layout
		// GitHub doesn't have the checkboxes when the current user can't edit the repo, so let's add them
		const issuesToolbar = select('#js-issues-toolbar')!;
		issuesToolbar.prepend(
			<div className="mr-3 d-none d-md-block">
				<input data-check-all type="checkbox" aria-label="Select all issues" autoComplete="off"/>
			</div>
		);
		issuesToolbar.append(
			<div className="table-list-triage flex-auto js-issues-toolbar-triage">
				<span className="text-gray table-list-header-toggle">
					<span data-check-all-count="">1</span>
					{' selected '}
					<button type="button" className="btn-link rgh-batch-open-issues pl-3">Open selected</button>
				</span>
			</div>
		);

		await domLoaded;
		for (const conversation of select.all('.js-issue-row')) {
			const number = looseParseInt(conversation.id);
			conversation.firstElementChild!.prepend(
				<label className="flex-shrink-0 py-2 pl-3  d-none d-md-block">
					<input
						data-check-all-item
						type="checkbox"
						className="js-issues-list-check"
						name="issues[]"
						value={number}
						aria-labelledby={`issue_${number}_link`}
						autoComplete="off"
					/>
				</label>
			);
		}
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.isConversationList
	],
	awaitDomReady: false,
	init
});
