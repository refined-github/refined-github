import React from 'dom-chef';
import {$$, elementExists} from 'select-dom';
import delegate, {DelegateEvent} from 'delegate-it';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import openTabs from '../helpers/open-tabs.js';
import {attachElements} from '../helpers/attach-element.js';

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
	const issues = $$(`${issueListSelector} .js-issue-row`)
		// TODO: Use conditional :has(:checked) instead
		.filter(issue => onlySelected ? elementExists(':checked', issue) : true);
	void openTabs(issues.map(issue => getUrlFromItem(issue)));
}

async function hasMoreThanOneConversation(): Promise<boolean> {
	return Boolean(await elementReady('.js-issue-row + .js-issue-row', {waitForChildren: false}));
}

async function init(signal: AbortSignal): Promise<void | false> {
	attachElements('.table-list-header-toggle:not(.states)', {
		prepend: anchor => (
			<button
				type="button"
				className="btn-link rgh-open-all-conversations px-2"
			>
				{anchor.closest('.table-list-triage') ? 'Open selected' : 'Open all'}
			</button>
		)},
	);

	delegate('button.rgh-open-all-conversations', 'click', onButtonClick, {signal});
}

void features.add(import.meta.url, {
	asLongAs: [
		hasMoreThanOneConversation,
	],
	include: [
		pageDetect.isIssueOrPRList,
	],
	exclude: [
		pageDetect.isGlobalIssueOrPRList,
	],
	init,
}, {
	include: [
		pageDetect.isGlobalIssueOrPRList,
	],
	init,
});

/*

Test URLs:

- Global: https://github.com/issues
- Repo: https://github.com/sindresorhus/refined-github/pulls
- Nothing to open: https://github.com/fregante/empty/pulls

*/
