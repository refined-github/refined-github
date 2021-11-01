import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';

function getUrlFromItem(issue: Element): string {
	return issue
		.closest('.js-issue-row')!
		.querySelector('a.js-navigation-open')!
		.href;
}

// eslint-disable-next-line import/prefer-default-export
export function confirmOpen(count: number): boolean {
	return count < 10 || confirm(`This will open ${count} new tabs. Continue?`);
}

function onButtonClick(): void {
	const modifier = pageDetect.isGlobalConversationList() ? '' : ' + div ';
	const issues = select.all(`#js-issues-toolbar:not(.triage-mode) ${modifier} .js-issue-row`);

	if (!confirmOpen(issues.length)) {
		return;
	}

	void browser.runtime.sendMessage({
		openUrls: issues.map(issue => getUrlFromItem(issue)),
	});
}

async function init(): Promise<void | false> {
	if (!await elementReady('.js-issue-row + .js-issue-row', {waitForChildren: false})) {
		return false;
	}

	delegate(document, '.rgh-open-all-conversations', 'click', onButtonClick);
	select('.table-list-header-toggle:not(.states)')?.prepend(
		<button
			type="button"
			className="btn-link rgh-open-all-conversations px-2"
		>
			Open all
		</button>,
	);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isConversationList,
	],
	awaitDomReady: false,
	deduplicate: 'has-rgh-inner',
	init,
});
