import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import batchedFunction from 'batched-function';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

const issueRowSelector = '[class^="IssueRow-module__row"]';
const badgesContainerSelector = '[class*="trailingBadgesContainer"]';
const mainContentInnerSelector = '[class^="MainContent-module__inner"]';
const issueTypeContainerSelector = '[class*="issueTypeTokenContainer"]';

const ghMargin = 'var(--base-size-4)';

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

		mainContentInner.style.gap = ghMargin;
		mainContentInner.append(badgesContainer);

		const issueTypeTokenContainer = issueRow.querySelector(issueTypeContainerSelector);
		if (!issueTypeTokenContainer) {
			continue;
		}

		issueTypeTokenContainer.style.marginRight = ghMargin;
		issueTypeTokenContainer.style.display = 'inline-block';
		badgesContainer.prepend(issueTypeTokenContainer);

		issueTypeTokenContainer.after(
			<span style={{display: 'inline-block', marginLeft: ghMargin}}>•</span>,
		);
	}
}

async function init(signal: AbortSignal): Promise<void> {
	observe(issueRowSelector, batchedFunction(alignBadges, {delay: 100}), {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoIssueList,
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
