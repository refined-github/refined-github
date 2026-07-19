import type {DelegateEvent} from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import {buildRepoUrl} from '../github-helpers/index.js';
import onAlteredClick from '../helpers/on-altered-click.js';
import onetime from '../helpers/onetime.js';
import observe from '../helpers/selector-observer.js';

// Cache it just like their modal does
// https://github.com/refined-github/refined-github/issues/9641
const {pathname} = location;

function disableLink(link: HTMLAnchorElement): void {
	if (link.getAttribute('href') !== pathname) {
		throw new Error('The template chooser bug might have been fixed');
	}

	link.removeAttribute('href');
}

export const newIssueModalDeadLinks = 'div[data-testid="repository-and-template-picker-dialog"] a';

function initDeadLinksOnce(): void {
	// Explanation: https://github.com/refined-github/refined-github/issues/9615
	observe(newIssueModalDeadLinks, disableLink);
}

function openSearchResultInNewTab(event: DelegateEvent<PointerEvent, HTMLElement>): void {
	event.stopImmediatePropagation();
	event.preventDefault();

	const {href} = event.delegateTarget.dataset;
	if (!href) {
		throw new Error('Expected the search result item to have the `data-href` attribute');
	}

	window.open(href, '_blank');
}

function initSearchResultsOnce(): void {
	onAlteredClick(
		'li.ActionListItem[data-type="url-result"]',
		openSearchResultInNewTab,
	);
}

function openNewIssuePageInNewTab(event: DelegateEvent<MouseEvent, HTMLElement>): void {
	event.stopImmediatePropagation();
	event.preventDefault();
	window.open(buildRepoUrl('issues/new/choose'), '_blank');
}

function initNewIssueOnce(): void {
	onAlteredClick(
		[
			'li[aria-keyshortcuts="n"]:has(.octicon-issue-opened)',
			'button[class*="GlobalCreateMenu-module__actionMenuButton"]',
		],
		openNewIssuePageInNewTab,
	);
}

function initIssueTemplate(): void {
	onAlteredClick(
		'a[class^="IssueCreatePage-module__chooseTemplateLink"]',
		openNewIssuePageInNewTab,
	);
}

void features.add(import.meta.url, {
	init: onetime(initSearchResultsOnce),
}, {
	include: [
		pageDetect.isRepo,
	],
	init: onetime(initNewIssueOnce),
}, {
	include: [
		pageDetect.isNewIssue,
	],
	init: initIssueTemplate,
}, {
	init: onetime(initDeadLinksOnce),
});

/*

Test URLs:

- https://github.com/refined-github/refined-github
- https://github.com
- https://github.com/refined-github/refined-github/issues/new?template=2_feature_request.yml

*/
