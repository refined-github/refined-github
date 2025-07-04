import './align-issue-labels.css';

import * as pageDetect from 'github-url-detection';
import {$, $optional} from 'select-dom/strict.js';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

// TODO: Drop in 2026
void features.addCssFeature(import.meta.url);

/* React issue lists */

const issueSelector = '[class^="IssueRow-module__row"]';
const badgesSelector = '[class*="trailingBadgesContainer"]';
const mainContentSelector = '[class^="MainContent-module__inner"]';
const issueTypeSelector = '[class*="issueTypeTokenContainer"]';

function alignBadges(issue: HTMLElement): void {
	const badges = $(badgesSelector, issue);
	const mainContent = $(mainContentSelector, issue);

	if (badges.children.length === 0) {
		return;
	}

	badges.classList.add('rgh-issue-badges', 'mt-1');
	mainContent.classList.add('rgh-issue-main-content-inner');
	mainContent.append(badges);

	$('[class^="Description-module__container"]', issue).classList.add('rgh-issue-description');

	const issueType = $optional(issueTypeSelector, issue);
	if (issueType) {
		issueType.classList.add('rgh-issue-type', 'd-inline-block', 'mr-1');
		badges.prepend(issueType);
	}
}

function init(signal: AbortSignal): void {
	observe(issueSelector, alignBadges, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isIssueOrPRList,
	],
	init,
});

/*

# Test URLs

https://github.com/pulls
https://github.com/bmish/eslint-doc-generator/pulls
https://github.com/bmish/eslint-doc-generator/issues
https://github.com/bmish/eslint-doc-generator/milestone/1?closed=1
https://github.com/nrwl/nx/issues

*/
