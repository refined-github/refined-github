import React from 'dom-chef';
import {$$} from 'select-dom/strict.js';
import delegate from 'delegate-it';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import openTabs from '../helpers/open-tabs.js';
import observe from '../helpers/selector-observer.js';

function onButtonClick(): void {
	const links = $$([
		'a[data-testid="issue-pr-title-link"]',
		'a.h4.js-navigation-open', // TODO: Pre-React selector; Drop in 2026
	]);

	if (links.length > 25) {
		console.warn('Selected too many links. Is the selector still correct?');
	}

	const selectedLinks = links.filter(link =>
		link.closest([
			'.js-issue-row.selected', // TODO: Pre-React selector; Drop in 2026
			'[aria-label^="Selected"]',
		]));

	const linksToOpen = selectedLinks.length > 0
		? selectedLinks
		: links;

	const urls = linksToOpen.map(link => link.href);
	void openTabs(urls);
}

const multipleConversationsSelector = [
	'.js-issue-row + .js-issue-row', // TODO: Pre-React selector; Drop in 2026
	'[role="list"] > div:nth-child(2) > [class^="IssueRow"]',
] as const;

async function hasMoreThanOneConversation(): Promise<boolean> {
	return Boolean(await elementReady(multipleConversationsSelector.join(', '), {waitForChildren: false}));
}

function add(anchor: HTMLElement): void {
	const isLegacy = anchor.closest('.table-list-header-toggle');
	const isSelected = anchor.closest([
		'.table-list-triage', // TODO: Pre-React selector; Drop in 2026
		'[aria-label="Bulk actions"]',
	]);
	const classes = isLegacy
		? 'btn-link px-2'
		: isSelected
			? 'btn'
			: 'btn btn-sm';
	anchor.prepend(<button
		type='button'
		className={`rgh-open-all-conversations ${classes}`}
	>
		{isSelected
			? 'Open selected'
			: 'Open all'}
	</button>);
}

async function init(signal: AbortSignal): Promise<void | false> {
	observe([
		'.table-list-header-toggle:not(.states)', // TODO: Pre-React selector; Drop in 2026
		'[aria-label="Bulk actions"] > :first-child',
		'[aria-label="Actions"] > :first-child',
	], add, {signal});
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
