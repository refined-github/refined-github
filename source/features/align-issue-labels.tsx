import './align-issue-labels.css';

import * as pageDetect from 'github-url-detection';
import {$, $optional} from 'select-dom/strict.js';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

void features.addCssFeature(import.meta.url);

/* New view */

const issueSelector = '[class^="IssueRow-module__row"]';
const badgesSelector = '[class*="trailingBadgesContainer"]';
const mainContentSelector = '[class^="MainContent-module__inner"]';
const descriptionSelector = '[class^="Description-module__container"]';
const issueTypeSelector = '[class*="issueTypeTokenContainer"]';

function alignBadges(issue: HTMLElement): void {
	const badges = $(badgesSelector, issue);
	const mainContent = $(mainContentSelector, issue);
	const issueType = $optional(issueTypeSelector, issue);

	if (badges.children.length === 0) {
		return;
	}

	badges.classList.add('rgh-issue-badges');
	mainContent.classList.add('rgh-issue-main-content-inner');
	mainContent.append(badges);

	if (issueType) {
		issueType.classList.add('rgh-issue-type');
		badges.prepend(issueType);
	}

	$('[class^="Description-module__container"]', issue).classList.add('rgh-issue-description');
}

async function init(signal: AbortSignal): Promise<void> {
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
https://github.com/bmish/eslint-doc-generator/milestone/1
https://github.com/nrwl/nx/issues

*/
