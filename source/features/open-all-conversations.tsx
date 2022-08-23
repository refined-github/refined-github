import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import openTabs from '../helpers/open-tabs';

function getUrlFromItem(issue: Element): string {
	return issue
		.closest('.js-issue-row')!
		.querySelector('a.js-navigation-open')!
		.href;
}

const issueListSelector = pageDetect.isGlobalIssueOrPRList()
	? '#js-issues-toolbar div'
	: 'div[aria-label="Issues"][role="group"]';

function onButtonClick(): void {
	const issues = select.all(`${issueListSelector} .js-issue-row`);
	openTabs(issues.map(issue => getUrlFromItem(issue)));
}

async function init(signal: AbortSignal): Promise<void | false> {
	if (!await elementReady('.js-issue-row + .js-issue-row', {waitForChildren: false})) {
		return false;
	}

	select('.table-list-header-toggle:not(.states)')?.prepend(
		<button
			type="button"
			className="btn-link rgh-open-all-conversations px-2"
		>
			Open all
		</button>,
	);

	delegate(document, '.rgh-open-all-conversations', 'click', onButtonClick, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isIssueOrPRList,
	],
	exclude: [
		pageDetect.isGlobalIssueOrPRList,
	],
	awaitDomReady: false,
	deduplicate: '.rgh-open-all-conversations',
	init,
}, {
	include: [
		pageDetect.isGlobalIssueOrPRList,
	],
	awaitDomReady: false,
	deduplicate: '.rgh-open-all-conversations',
	init,
});
