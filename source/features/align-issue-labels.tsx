import './align-issue-labels.css';

import * as pageDetect from 'github-url-detection';
import batchedFunction from 'batched-function';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

const issueRowSelector = '[class^="IssueRow-module__row"]';
const badgesContainerSelector = '[class*="trailingBadgesContainer"]';
const mainContentInnerSelector = '[class^="MainContent-module__inner"]';
const descriptionContainerSelector = '[class^="Description-module__container"]';
const issueTypeContainerSelector = '[class*="issueTypeTokenContainer"]';

function alignBadges(issueRows: HTMLElement[]): void {
	for (const issueRow of issueRows) {
		const badgesContainer = issueRow.querySelector(badgesContainerSelector);
		if (!badgesContainer) {
			continue;
		}

		const mainContentInner = issueRow.querySelector(mainContentInnerSelector);
		if (!mainContentInner) {
			continue;
		}

		badgesContainer.classList.add('rgh-issue-badges');
		mainContentInner.classList.add('rgh-issue-main-content-inner');
		mainContentInner.append(badgesContainer);

		const descriptionContainer = issueRow.querySelector(descriptionContainerSelector);
		descriptionContainer?.classList.add('rgh-issue-description');

		const issueTypeTokenContainer = issueRow.querySelector(issueTypeContainerSelector);
		if (!issueTypeTokenContainer) {
			continue;
		}

		issueTypeTokenContainer.classList.add('rgh-issue-type');
		badgesContainer.prepend(issueTypeTokenContainer);
	}
}

async function init(signal: AbortSignal): Promise<void> {
	observe(issueRowSelector, batchedFunction(alignBadges, {delay: 100}), {signal});
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
