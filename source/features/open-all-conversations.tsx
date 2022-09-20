import React from 'dom-chef';
import select from 'select-dom';
import delegate, {DelegateEvent} from 'delegate-it';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import openTabs from '../helpers/open-tabs';
import {attachElements} from '../helpers/attach-element';

function getUrlFromItem(issue: Element): string {
	return issue
		.closest('.js-issue-row')!
		.querySelector('a.js-navigation-open')!
		.href;
}

const issueListSelector = pageDetect.isGlobalIssueOrPRList()
	? '#js-issues-toolbar div'
	: 'div[aria-label="Issues"][role="group"]';

function onButtonClick(event: DelegateEvent<MouseEvent, HTMLButtonElement>): void {
	const onlySelected = event.delegateTarget.closest('.table-list-triage');
	const issues = select.all(`${issueListSelector} .js-issue-row`)
		// TODO: Use conditional :has(:checked) instead
		.filter(issue => onlySelected ? select.exists(':checked', issue) : true);
	void openTabs(issues.map(issue => getUrlFromItem(issue)));
}

async function init(signal: AbortSignal): Promise<void | false> {
	if (!await elementReady('.js-issue-row + .js-issue-row', {waitForChildren: false})) {
		return false;
	}

	attachElements({
		anchor: '.table-list-header-toggle:not(.states)',
		prepend: anchor => (
			<button
				type="button"
				className="btn-link rgh-open-all-conversations px-2"
			>
				{anchor.closest('.table-list-triage') ? 'Open selected' : 'Open all'}
			</button>
		)},
	);

	delegate(document, 'button.rgh-open-all-conversations', 'click', onButtonClick, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isIssueOrPRList,
	],
	exclude: [
		pageDetect.isGlobalIssueOrPRList,
	],
	awaitDomReady: false,
	init,
}, {
	include: [
		pageDetect.isGlobalIssueOrPRList,
	],
	awaitDomReady: false,
	init,
});
