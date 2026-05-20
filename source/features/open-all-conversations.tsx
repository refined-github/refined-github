import delegate from 'delegate-it';
import React from 'dom-chef';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import {$$, $closestOptional} from 'select-dom';

import features from '../feature-manager.js';
import openTabs from '../helpers/open-tabs.js';
import observe from '../helpers/selector-observer.js';

function onButtonClick(): void {
	const links = $$([
		'a[data-testid="issue-pr-title-link"]', // Issue list
		'a.h4.js-navigation-open', // PR list
	]);

	if (links.length > 25) {
		console.warn('Selected too many links. Is the selector still correct?');
	}

	const selectedLinks = links.filter(link =>
		$closestOptional([
			'.js-issue-row.selected', // PR list
			'[aria-label^="Selected"]', // Issue list
		], link),
	);

	const linksToOpen = selectedLinks.length > 0
		? selectedLinks
		: links;

	const urls = linksToOpen.map(link => link.href);
	void openTabs(urls);
}

const conversationCounterSelector = [
	'a[data-ga-click="Pull Requests, Table state, Open"]', // PR list
	'ul[class*="ListItems-module__tabsContainer"] > li:first-child span[class^="SectionFilterLink-module__count"]', // Issue list
] as const;

async function hasMoreThanOneConversation(): Promise<boolean> {
	const counter = await elementReady(conversationCounterSelector, {stopOnDomReady: false});
	const count = Number.parseInt(counter!.textContent, 10);
	return count > 1;
}

function add(anchor: HTMLElement): void {
	const isLegacy = $closestOptional('.table-list-header-toggle', anchor);
	const isSelected = $closestOptional([
		'.table-list-triage', // PR list
		'[aria-label="Bulk actions"]', // Issue list
	], anchor);
	const classes = isLegacy
		? 'btn-link px-2'
		: isSelected
			? 'btn'
			: 'btn btn-sm';
	anchor.prepend(
		<button
			type="button"
			className={`rgh-open-all-conversations ${classes}`}
		>
			{isSelected
				? 'Open selected'
				: 'Open all'}
		</button>,
	);
}

async function init(signal: AbortSignal): Promise<void | false> {
	observe(
		[
			'.table-list-header-toggle:not(.states)', // PR list
			// Issue list
			'[aria-label="Bulk actions"] > :first-child',
			'[aria-label="Actions"] > :first-child',
		],
		add,
		{signal},
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
- Issues: https://github.com/refined-github/refined-github/issues
- PRs: https://github.com/refined-github/refined-github/pulls
- Nothing to open: https://github.com/fregante/empty/pulls

*/
