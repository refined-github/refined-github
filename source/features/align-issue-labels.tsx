import './align-issue-labels.css';

import * as pageDetect from 'github-url-detection';
import {$} from 'select-dom/strict.js';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

// TODO: Drop line in 2026
void features.addCssFeature(import.meta.url);

function alignBadges(badges: HTMLElement): void {
	// Move badges to the last line
	const conversation = badges.closest('li')!;
	$('[class^="MainContent-module__inner"]', conversation).append(badges);
	badges.classList.add('mt-1');
}

function init(signal: AbortSignal): void {
	observe('[class*="trailingBadgesContainer"]:not(:empty)', alignBadges, {signal});
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
