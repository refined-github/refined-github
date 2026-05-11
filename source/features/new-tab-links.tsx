import type {DelegateEvent} from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import {buildRepoUrl} from '../github-helpers/index.js';
import onAlteredClick from '../helpers/on-altered-click.js';
import onetime from '../helpers/onetime.js';

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

function openNewIssuePageInNewTabe(event: DelegateEvent<MouseEvent, HTMLElement>): void {
	event.stopImmediatePropagation();
	event.preventDefault();
	window.open(buildRepoUrl('issues/new/choose'), '_blank');
}

function initNewIssueOnce(): void {
	onAlteredClick(
		'li[aria-keyshortcuts="n"]:has(.octicon-issue-opened)',
		openNewIssuePageInNewTabe,
	);
}

function initIssueTemplate(): void {
	onAlteredClick(
		'a[class^="IssueCreatePage-module__chooseTemplateLink"]',
		openNewIssuePageInNewTabe,
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
});

/*

Test URLs:

- https://github.com/refined-github/refined-github
- https://github.com
- https://github.com/refined-github/refined-github/issues/new?template=2_feature_request.yml

*/
