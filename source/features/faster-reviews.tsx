import React from 'dom-chef';
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
	if ($exists('[data-hotkey="v"]', sidebarReviewsSection)) {
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
		$('textarea', delegateTarget)!.focus();
	}
}

async function initReviewButtonEnhancements(): Promise<void> {
	delegate(document, '.js-reviews-container > details', 'toggle', focusReviewTextarea, true);

	const reviewDropdownButton = await elementReady<HTMLElement>('.js-reviews-toggle');
	if (reviewDropdownButton) {
		reviewDropdownButton.dataset.hotkey = 'v';

		// This feature should be native but isn't currently working #3681
		if (location.hash === '#submit-review') {
			reviewDropdownButton.click();
		}
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.isPRConversation
	],
	additionalListeners: [
		() => void onReplacedElement('#partial-discussion-sidebar', addSidebarReviewButton)
	],
	awaitDomReady: false,
	init: addSidebarReviewButton
}, {
	shortcuts: {
		v: 'Open PR review popup'
	},
	include: [
		pageDetect.isPRFiles
	],
	awaitDomReady: false,
	init: initReviewButtonEnhancements
});
