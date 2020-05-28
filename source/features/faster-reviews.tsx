import './faster-reviews.css';
import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import fetchDom from '../helpers/fetch-dom';
import onReplacedElement from '../helpers/on-replaced-element';

async function addSidebarReviewButton(): Promise<void> {
	const reviewDetailsDropdown = <details className="rgh-faster-reviews details-reset details-overlay js-dropdown-details d-inline text-gray-dark">
		<summary className="btn-link muted-link" data-hotkey="g r">review</summary>
	</details>;

	select('[aria-label="Select reviewers"] .discussion-sidebar-heading')!.append(
		<span style={{fontWeight: 'normal'}} className="js-reviews-container">
			– {reviewDetailsDropdown}
		</span>
	);

	const prFilesUrl = new URL(location.href);
	prFilesUrl.pathname += '/files'

	const reviewMenu = await fetchDom<HTMLDivElement>(
		prFilesUrl.href,
		'#submit-review'
	);

	reviewDetailsDropdown.append(reviewMenu!);
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

async function init(): Promise<void> {
	delegate(document, '.js-reviews-container > details', 'toggle', focusReviewTextarea, true);

	const reviewDropdownButton = await elementReady('.js-reviews-toggle');
	reviewDropdownButton?.setAttribute('data-hotkey', 'g r');
}

features.add({
	id: __filebasename,
	description: 'Adds a review button to the PR sidebar, autofocuses the review textarea and adds a keyboard shortcut to open the review popup: `g` `r`.',
	screenshot: 'TODO',
	shortcuts: {
		'g r': 'Open review popup in PRs'
	}
}, {
	include: [
		pageDetect.isPRConversation
	],
	additionalListeners: [
		() => onReplacedElement('#partial-discussion-sidebar', addSidebarReviewButton)
	],
	init: initSidebar
}, {
	include: [
		pageDetect.isPR
	],
	init
});
