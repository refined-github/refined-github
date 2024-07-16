import React from 'dom-chef';
import {$$, elementExists} from 'select-dom';
import delegate, {DelegateEvent} from 'delegate-it';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import openTabs from '../helpers/open-tabs.js';
import observe from '../helpers/selector-observer.js';

const issueListSelector = pageDetect.isGlobalIssueOrPRList()
	? '#js-issues-toolbar div'
	: 'div[aria-label="Issues"][role="group"]';

function onButtonClick(event: DelegateEvent<MouseEvent, HTMLButtonElement>): void {
	const onlySelected = event.delegateTarget.closest('.table-list-triage')
		? ':has(:checked)'
		: '';

	const issueSelector = `${issueListSelector} .js-issue-row${onlySelected} a.js-navigation-open`;

	const urls = $$(issueSelector as 'a').map(issue => issue.href);
	void openTabs(urls);
}

async function hasMoreThanOneConversation(): Promise<boolean> {
	return Boolean(await elementReady('.js-issue-row + .js-issue-row', {waitForChildren: false}));
}

function add(anchor: HTMLElement): void {
	anchor.prepend(
		<button
			type="button"
			className="btn-link rgh-open-all-conversations px-2"
		>
			{anchor.closest('.table-list-triage') ? 'Open selected' : 'Open all'}
		</button>,
	);
}

async function init(signal: AbortSignal): Promise<void | false> {
	observe('.table-list-header-toggle:not(.states)', add, {signal});
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
