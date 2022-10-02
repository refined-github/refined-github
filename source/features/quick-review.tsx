import React from 'dom-chef';
import select from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import delegate, {DelegateEvent} from 'delegate-it';

import features from '../feature-manager';
import observe from '../helpers/selector-observer';
import attachElement from '../helpers/attach-element';

function createReviewLink(): Element {
	const reviewFormUrl = new URL(location.href);
	reviewFormUrl.pathname += '/files';
	reviewFormUrl.hash = 'review-changes-modal';

	return (
		<span className="text-normal">
			– <a href={reviewFormUrl.href} className="btn-link Link--muted" data-hotkey="v" data-pjax="#repo-content-pjax-container">review now</a>
		</span>
	);
}

function addSidebarReviewButton(reviewersSection: Element): void {
	attachElement(reviewersSection, {
		append: createReviewLink,
	});
}

function initSidebarReviewButton(signal: AbortSignal): void {
	observe('[aria-label="Select reviewers"] .discussion-sidebar-heading', addSidebarReviewButton, {signal});
}

function focusReviewTextarea({delegateTarget}: DelegateEvent<Event, HTMLDetailsElement>): void {
	if (delegateTarget.open) {
		select('textarea', delegateTarget)!.focus();
	}
}

async function initReviewButtonEnhancements(signal: AbortSignal): Promise<void> {
	delegate(document, '.js-reviews-container > details', 'toggle', focusReviewTextarea, {capture: true, signal});

	const reviewDropdownButton = await elementReady('.js-reviews-toggle');
	if (reviewDropdownButton) {
		reviewDropdownButton.dataset.hotkey = 'v';
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRConversation,
	],
	awaitDomReady: false,
	init: initSidebarReviewButton,
}, {
	shortcuts: {
		v: 'Open PR review popup',
	},
	include: [
		pageDetect.isPRFiles,
	],
	awaitDomReady: false,
	init: initReviewButtonEnhancements,
});
