import React from 'dom-chef';
import delay from 'delay';
import {$} from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import delegate, {DelegateEvent} from 'delegate-it';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

async function addSidebarReviewButton(reviewersSection: Element): Promise<void> {
	const reviewFormUrl = new URL(location.href);
	reviewFormUrl.pathname += '/files';
	reviewFormUrl.hash = 'review-changes-modal';

	// Occasionally this button appears before "Reviewers", so let's wait a bit longer
	await delay(300);
	reviewersSection.append(
		<span className="text-normal">
			– <a href={reviewFormUrl.href} className="btn-link Link--muted" data-hotkey="v" data-turbo-frame="repo-content-turbo-frame">review now</a>
		</span>,
	);
}

function initSidebarReviewButton(signal: AbortSignal): void {
	observe('[aria-label="Select reviewers"] .discussion-sidebar-heading', addSidebarReviewButton, {signal});
}

function focusReviewTextarea({delegateTarget}: DelegateEvent<Event, HTMLDetailsElement>): void {
	if (delegateTarget.open) {
		$('textarea', delegateTarget)!.focus();
	}
}

async function initReviewButtonEnhancements(signal: AbortSignal): Promise<void> {
	delegate('.js-reviews-container > details', 'toggle', focusReviewTextarea, {capture: true, signal});

	const reviewDropdownButton = await elementReady('.js-reviews-toggle');
	if (reviewDropdownButton) {
		reviewDropdownButton.dataset.hotkey = 'v';
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRConversation,
	],
	init: initSidebarReviewButton,
}, {
	shortcuts: {
		v: 'Open PR review popup',
	},
	include: [
		pageDetect.isPRFiles,
	],
	init: initReviewButtonEnhancements,
});

/*

Test URLs:

https://github.com/refined-github/sandbox/pull/10

*/
