import React from 'dom-chef';
import {$} from 'select-dom/strict.js';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import delegate, {type DelegateEvent} from 'delegate-it';

import delay from '../helpers/delay.js';
import api from '../github-helpers/api.js';
import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import showToast from '../github-helpers/toast.js';
import {
	getConversationNumber,
	getLoggedInUser,
	scrollIntoViewIfNeeded,
	triggerConversationUpdate,
} from '../github-helpers/index.js';
import {randomArrayItem} from '../helpers/math.js';
import {getToken} from '../options-storage.js';

const emojis = [...'🚀🐿️⚡️🤌🥳🥰🤩🥸😎🤯🚢🛫🏳️🏁'];

async function quickApprove(event: DelegateEvent<MouseEvent>): Promise<void> {
	const approval = event.altKey ? '' : prompt('Approve instantly? You can add a custom message or leave empty');
	if (approval === null) {
		return;
	}

	const call = api.v3(`pulls/${getConversationNumber()!}/reviews`, {
		method: 'POST',
		body: {event: 'APPROVE', body: approval},
	});

	await showToast(call, {
		message: 'Approving…',
		doneMessage: `${randomArrayItem(emojis)} Approved`,
	});

	// Update timeline and scroll to bottom so the new review appears in view
	scrollIntoViewIfNeeded($('#partial-timeline'));
	triggerConversationUpdate();
}

async function addSidebarReviewButton(reviewersSection: Element): Promise<void> {
	const reviewFormUrl = new URL(location.href);
	reviewFormUrl.pathname += '/files';
	reviewFormUrl.hash = 'review-changes-modal';

	// Occasionally this button appears before "Reviewers", so let's wait a bit longer
	await delay(300);
	const quickReview = (
		<span className="text-normal color-fg-muted">
			– <a href={reviewFormUrl.href} className="btn-link Link--muted Link--inTextBlock" data-hotkey="v" data-turbo-frame="repo-content-turbo-frame" title="Hotkey: V">review now</a>
		</span>
	);

	reviewersSection.append(quickReview);

	// Can't approve own PRs and closed PRs
	// API required for this action
	if (
		getLoggedInUser() === $('.author').textContent
		|| pageDetect.isClosedConversation()
		|| !(await getToken())
	) {
		return;
	}

	quickReview.append(
		' – ',
		<button
			type="button"
			className="btn-link Link--muted Link--inTextBlock rgh-quick-approve tooltipped tooltipped-nw"
			aria-label="Hold alt to approve without confirmation"
		>
			approve now
		</button>,
	);
}

async function initSidebarReviewButton(signal: AbortSignal): Promise<void> {
	observe('#reviewers-select-menu .discussion-sidebar-heading', addSidebarReviewButton, {signal});
	delegate('.rgh-quick-approve', 'click', quickApprove, {signal});
}

function focusReviewTextarea(event: DelegateEvent<Event, HTMLElement>): void {
	if ('newState' in event && event.newState === 'open') {
		$('textarea', event.delegateTarget).focus();
	}
}

async function initReviewButtonEnhancements(signal: AbortSignal): Promise<void> {
	delegate('#review-changes-modal', 'toggle', focusReviewTextarea, {capture: true, signal});

	const reviewDropdownButton = await elementReady('.js-reviews-toggle');
	if (reviewDropdownButton) {
		reviewDropdownButton.dataset.hotkey = 'v';
	}
}

async function openReviewPopup(button: HTMLButtonElement): Promise<void> {
	await delay(100); // The popover appears immediately afterwards in the HTML, observe() might trigger too soon
	(button.popoverTargetElement as HTMLElement).showPopover();
}

function initNativeDeepLinking(signal: AbortSignal): void {
	// Cannot target the [popover] itself because observe() can't see hidden elements
	observe('[popovertarget="review-changes-modal"]', openReviewPopup, {signal});
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
}, {
	asLongAs: [
		() => location.hash === '#review-changes-modal',
		pageDetect.isPRFiles,
	],
	init: initNativeDeepLinking,
});

/*

Test URLs:

- Open PR (review, approve) https://github.com/refined-github/sandbox/pull/10
- Closed PR (only review) https://github.com/refined-github/sandbox/pull/26

*/
