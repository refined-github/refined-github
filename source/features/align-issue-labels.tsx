import './align-issue-labels.css';

import * as pageDetect from 'github-url-detection';
import {$, $optional} from 'select-dom/strict.js';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

// TODO: Drop line in 2026
void features.addCssFeature(import.meta.url);

function alignBadges(row: HTMLElement): void {
	const badges = $('[class*="trailingBadgesContainer"]', row);
	if (badges.children.length === 0) {
		return;
	}
	badges.classList.add('rgh-issue-badges', 'mt-1');

	const mainContent = $('[class^="MainContent-module__inner"]', row);
	mainContent.classList.add('gap-1');
	mainContent.append(badges);

	$('[class^="Description-module__container"]', row).style.gap = 'unset';

	const issueType = $optional('[class*="issueTypeTokenContainer"]', row);
	if (issueType) {
		issueType.classList.add('rgh-issue-type', 'd-inline-block');
		badges.prepend(issueType);
	}
}

function init(signal: AbortSignal): void {
	observe([
		'[class^="IssueRow-module__row"]',
		'[class^="PullRequestRow-module__row"]',
	], alignBadges, {signal});
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
