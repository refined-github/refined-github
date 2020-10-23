import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import onReplacedElement from '../helpers/on-replaced-element';

async function addSidebarReviewButton(): Promise<void | false> {
	const reviewFormUrl = new URL(location.href);
	reviewFormUrl.pathname += '/files';
	reviewFormUrl.hash = 'submit-review';

	const sidebarReviewsSection = await elementReady('[aria-label="Select reviewers"] .discussion-sidebar-heading');
	if (select.exists('[data-hotkey="v"]', sidebarReviewsSection)) {
		return false;
	}

	sidebarReviewsSection!.append(
		<span style={{fontWeight: 'normal'}}>
			– <a href={reviewFormUrl.href} className="btn-link muted-link" data-hotkey="v">review now</a>
		</span>
	);
}

function focusReviewTextarea({delegateTarget}: delegate.Event<Event, HTMLDetailsElement>): void {
	if (delegateTarget.open) {
		select('textarea', delegateTarget)!.focus();
	}
}

async function initReviewButtonEnhancements(): Promise<void> {
	delegate(document, '.js-reviews-container > details', 'toggle', focusReviewTextarea, true);

	const reviewDropdownButton = await elementReady<HTMLElement>('.js-reviews-toggle');
	if (reviewDropdownButton) {
		reviewDropdownButton.dataset.hotkey = 'v';
	}

	if (location.hash === '#submit-review') {
		reviewDropdownButton?.click();
		location.hash = '';
	}
}

void features.add({
	id: __filebasename,
	description: 'Adds a review button to the PR sidebar, autofocuses the review textarea and adds a keyboard shortcut to open the review popup: `v`.',
	screenshot: 'https://user-images.githubusercontent.com/202916/83269671-bb3b2200-a1c7-11ea-90b3-b9457a454162.png',
	shortcuts: {
		v: 'Open PR review popup'
	}
}, {
	include: [
		pageDetect.isPRConversation
	],
	additionalListeners: [
		() => void onReplacedElement('#partial-discussion-sidebar', addSidebarReviewButton)
	],
	awaitDomReady: false,
	init: addSidebarReviewButton
}, {
	include: [
		pageDetect.isPRFiles
	],
	awaitDomReady: false,
	init: initReviewButtonEnhancements
});
