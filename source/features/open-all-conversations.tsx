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
		// Issue list
		'a[data-testid="issue-pr-title-link"]',
		// PR list -- TODO: Drop after global and repo PR lists become exclusively React-based
		'a.h4.js-navigation-open',
	]);

	if (links.length > 25) {
		console.warn('Selected too many links. Is the selector still correct?');
	}

	const selectedLinks = links.filter(link =>
		$closestOptional([
			// PR list -- TODO: Drop after global and repo PR lists become exclusively React-based
			'.js-issue-row.selected',
			// Issue list
			'[aria-label^="Selected"]',
		], link),
	);

	const linksToOpen = selectedLinks.length > 0
		? selectedLinks
		: links;

	const urls = linksToOpen.map(link => link.href);
	void openTabs(urls);
}

const multipleConversationsSelector = [
	// PR list -- TODO: Drop after global and repo PR lists become exclusively React-based
	'.js-issue-row + .js-issue-row',
	// Issue list
	'[role="list"] > div:nth-child(2) > [class*="Row-module__row"]', // Can be either PR or issue
] as const;

async function hasMoreThanOneConversation(): Promise<boolean> {
	return Boolean(await elementReady(
		multipleConversationsSelector,
		{stopOnDomReady: false, waitForChildren: false},
	));
}

function add(anchor: HTMLElement): void {
	const isLegacy = $closestOptional('.table-list-header-toggle', anchor);
	const isSelected = $closestOptional([
		// PR list -- TODO: Drop after global and repo PR lists become exclusively React-based
		'.table-list-triage',
		// Issue list
		'[aria-label="Bulk actions"]',
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
			// PR list -- TODO: Drop after global and repo PR lists become exclusively React-based
			'.table-list-header-toggle:not(.states)',
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
