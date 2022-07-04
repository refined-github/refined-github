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

const issueListSelector = pageDetect.isGlobalConversationList()
	? '#js-issues-toolbar div'
	: 'div[aria-label="Issues"][role="group"]';

function onButtonClick(): void {
	const issues = select.all(`${issueListSelector} .js-issue-row`);
	openTabs(issues.map(issue => getUrlFromItem(issue)));
}

async function init(): Promise<Deinit | false> {
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

	return delegate(document, '.rgh-open-all-conversations', 'click', onButtonClick);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isConversationList,
	],
	exclude: [
		pageDetect.isGlobalConversationList,
	],
	awaitDomReady: false,
	deduplicate: 'has-rgh-inner',
	init,
}, {
	include: [
		pageDetect.isGlobalConversationList,
	],
	awaitDomReady: false,
	init,
});
