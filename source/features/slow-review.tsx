import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import {messageRuntime} from 'webext-msg';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

function closeTab(): void {
	void messageRuntime({closeTab: true});
}

async function addSidebarReviewButton(reviewersSection: Element): Promise<void> {
	if (!reviewersSection.querySelector('.rgh-slow-review-link')) {
		reviewersSection.append(
			<span className="rgh-slow-review-link text-normal color-fg-muted">
				– <button type="button" className="btn-link Link--muted Link--inTextBlock" onClick={closeTab}>review later</button>
			</span>,
		);
	}
}

async function init(signal: AbortSignal): Promise<void> {
	observe('#reviewers-select-menu .discussion-sidebar-heading', addSidebarReviewButton, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRConversation,
	],
	init,
});

/*

Test URLs:

- Open PR (review, approve) https://github.com/refined-github/sandbox/pull/10
- Closed PR (only review) https://github.com/refined-github/sandbox/pull/26

*/
