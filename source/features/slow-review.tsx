import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

async function addSidebarReviewButton(reviewersSection: Element): Promise<void> {
	const reviewFormUrl = new URL(location.href);
	reviewFormUrl.pathname += '/files';
	reviewFormUrl.hash = '';

	if (!reviewersSection.querySelector('.rgh-slow-review-link')) {
		reviewersSection.append(
			<span className="rgh-slow-review-link text-normal color-fg-muted">
				– <a href={reviewFormUrl.href} className="btn-link Link--muted Link--inTextBlock" title="Go to the files tab first">review later</a>
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
