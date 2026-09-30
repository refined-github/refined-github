import cx from 'clsx';
import delegate from 'delegate-it';
import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import {$$, closestElementOptional} from 'select-dom';

import features from '../feature-manager.js';
import openTabs from '../helpers/open-tabs.js';
import observe from '../helpers/selector-observer.js';

function onButtonClick(): void {
	const links = $$([
		'a[data-testid="issue-pr-title-link"]', // Issue list
		'a[data-testid="listitem-title-link"]', // PR list
		// TODO [2027-01-01]: Drop if PR lists have turned React
		'a.h4.js-navigation-open',
	]);

	if (links.length > 25) {
		console.warn('Selected too many links. Is the selector still correct?');
	}

	const selectedLinks = links.filter(link =>
		closestElementOptional([
			// TODO [2027-01-01]: Drop if PR lists have turned React
			'.js-issue-row.selected',
			'[aria-label^="Selected"]',
		], link)
	);

	const linksToOpen = selectedLinks.length > 0
		? selectedLinks
		: links;

	const urls = linksToOpen.map(link => link.href);
	void openTabs(urls);
}

function add(anchor: HTMLElement): void {
	// TODO: Drop after https://github.com/refined-github/refined-github/issues/9893
	if (closestElementOptional('[class*="RepositoryViews"]', anchor)) {
		// The user navigate to https://github.com/refined-github/refined-github/issues/views but the previous observer was not unloaded
		return;
	}

	const isLegacy = closestElementOptional('.table-list-header-toggle', anchor);
	const isSelected = closestElementOptional([
		// TODO [2027-01-01]: Drop if PR lists have turned React
		'.table-list-triage',
		'[aria-label="Bulk actions"]',
		'[aria-label="Pull request actions"]',
	], anchor);
	const classes = isLegacy
		? 'btn-link px-2'
		: isSelected
		? 'btn'
		: 'btn btn-sm';
	anchor.prepend(
		<button
			type="button"
			className={cx('rgh-open-all-conversations', classes)}
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
			// TODO [2027-01-01]: Drop if PR lists have turned React
			'.table-list-header-toggle:not(.states)',
			'[aria-label="Bulk actions"] > :first-child',
			'[aria-label="Actions"] > :first-child',
			// PR list: the filters are right-aligned inside the ActionBar's overflow container, so the button has to live in it to stay next to them
			'[class*="SharedListContainer-module__primerActionBar"] [class*="prc-ActionBar-OverflowContainer"]',
			'[aria-label="Pull request actions"] > :first-child',
		],
		add,
		{signal},
	);
	delegate('button.rgh-open-all-conversations', 'click', onButtonClick, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isIssueOrPRList,
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
