import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';

const confirmationRequiredCount = 10;

function getUrlFromItem(issue: Element): string {
	return issue
		.closest('.js-issue-row')!
		.querySelector('a.js-navigation-open')!
		.href;
}

function onButtonClick(): void {
	const modifier = pageDetect.isGlobalConversationList() ? '' : ' + div ';
	const issues = select.all(`#js-issues-toolbar:not(.triage-mode) ${modifier} .js-issue-row`);

	if (
		issues.length >= confirmationRequiredCount
		&& !confirm(`This will open ${issues.length} new tabs. Continue?`)
	) {
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

void features.add(import.meta.url, {
	include: [
		pageDetect.isConversationList,
	],
	awaitDomReady: false,
	deduplicate: 'has-rgh-inner',
	init,
});
