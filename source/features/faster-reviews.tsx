import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import onReplacedElement from '../helpers/on-replaced-element';

async function addSidebarReviewButton(): Promise<void> {
	const reviewFormUrl = new URL(location.href);
	reviewFormUrl.pathname += '/files';
	reviewFormUrl.hash = 'submit-review';

	select('[aria-label="Select reviewers"] .discussion-sidebar-heading')!.append(
		<span style={{fontWeight: 'normal'}}>
			– <a href={reviewFormUrl.href} className="btn-link muted-link" data-hotkey="v">review</a>
		</span>
	);
}

async function initSidebar(): Promise<void> {
	if (await elementReady('[aria-label="Select reviewers"] .discussion-sidebar-heading')) {
		addSidebarReviewButton();
	}
}

function focusReviewTextarea({delegateTarget}: delegate.Event<Event, HTMLDetailsElement>) {
	if (delegateTarget.open) {
		select('textarea', delegateTarget)!.focus();
	}
}

async function initReviewButtonEnhancements(): Promise<void> {
	delegate(document, '.js-reviews-container > details', 'toggle', focusReviewTextarea, true);

	const reviewDropdownButton = await elementReady<HTMLElement>('.js-reviews-toggle');
	reviewDropdownButton!.dataset.hotkey = 'v';
}

features.add({
	id: __filebasename,
	description: 'Adds a review button to the PR sidebar, autofocuses the review textarea and adds a keyboard shortcut to open the review popup: `v`.',
	screenshot: 'https://user-images.githubusercontent.com/202916/83146442-93c85480-a0f6-11ea-8422-d042dd734e02.png',
	shortcuts: {
		v: 'Open PR review popup'
	}
}, {
	include: [
		pageDetect.isPRConversation
	],
	additionalListeners: [
		() => onReplacedElement('#partial-discussion-sidebar', addSidebarReviewButton)
	],
	waitForDomReady: false,
	init: initSidebar
}, {
	include: [
		pageDetect.isPRFiles
	],
	waitForDomReady: false,
	init: initReviewButtonEnhancements
});
