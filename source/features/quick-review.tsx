import delegate, {type DelegateEvent} from 'delegate-it';
import React from 'dom-chef';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import {$} from 'select-dom/strict.js';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import {
	getConversationNumber,
	getLoggedInUser,
	scrollIntoViewIfNeeded,
	triggerConversationUpdate,
} from '../github-helpers/index.js';
import showToast from '../github-helpers/toast.js';
import delay from '../helpers/delay.js';
import {randomArrayItem} from '../helpers/math.js';
import observe from '../helpers/selector-observer.js';
import {getToken} from '../options-storage.js';

const emojis = ['🚀', '🐿️', '⚡️', '🤌', '🥳', '🥰', '🤩', '🥸', '😎', '🤯', '🚢', '🛫', '🏳️', '🏁'];

// Be careful not to select the "Submit review" button in the dialog
const reviewMenuButtonSelector = 'button[class*="ReviewMenuButton-module__ReviewMenuButton"]';

const openReviewMenuDeepLink = 'review-changes-modal';
const openReviewMenuDeepLinkSelector = `#${openReviewMenuDeepLink}`;

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
	reviewFormUrl.hash = openReviewMenuDeepLink;

	// Occasionally this button appears before "Reviewers", so let's wait a bit longer
	await delay(300);
	const quickReview = (
		<span className="text-normal color-fg-muted">
			{'– '}
			<button
				className="btn-link Link--muted Link--inTextBlock rgh-quick-review tooltipped tooltipped-nw"
				data-hotkey="v"
				aria-label="Hotkey: V"
			>
				review now
			</button>
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

function openReviewMenu(signal: AbortSignal): void {
	const prChangedFilesTab = $('a#prs-files-anchor-tab');

	if (prChangedFilesTab.href.endsWith('/changes')) {
		observe(reviewMenuButtonSelector, openReviewDialog, {signal, once: true});
	} else {
		// Old view -- TODO: Drop in the fall of 2026
		// Cannot target the [popover] itself because observe() can't see hidden elements
		observe(`[popovertarget="${openReviewMenuDeepLink}"]`, openReviewPopup, {signal, once: true});
	}

	prChangedFilesTab.click();
}

async function initSidebarReviewButton(signal: AbortSignal): Promise<void> {
	observe('#reviewers-select-menu .discussion-sidebar-heading', addSidebarReviewButton, {signal});
	delegate('.rgh-quick-approve', 'click', quickApprove, {signal});
	delegate('.rgh-quick-review', 'click', openReviewMenu.bind(undefined, signal), {signal});
}

function enhanceNativeReviewButton(signal: AbortSignal): void {
	delegate('section[aria-label="Review Request Banner"] a[type="button"]',
		'click',
		openReviewMenu.bind(undefined, signal),
		{capture: true, signal},
	);
}

function focusReviewTextarea(event: DelegateEvent<Event, HTMLElement>): void {
	if ('newState' in event && event.newState === 'open') {
		$('textarea', event.delegateTarget).focus();
	}
}

async function initReviewButtonEnhancements(signal: AbortSignal): Promise<void> {
	delegate(openReviewMenuDeepLinkSelector, 'toggle', focusReviewTextarea, {capture: true, signal});

	const reviewDropdownButton = await elementReady([
		reviewMenuButtonSelector,
		'.js-reviews-toggle', // Old view -- TODO: Drop in the fall of 2026
	]);
	if (reviewDropdownButton) {
		reviewDropdownButton.dataset.hotkey = 'v';
	}
}

async function openReviewPopup(button: HTMLButtonElement): Promise<void> {
	await delay(100); // The popover appears immediately afterwards in the HTML, observe() might trigger too soon
	(button.popoverTargetElement as HTMLElement).showPopover();
}

function openReviewDialog(reviewMenuButton: HTMLButtonElement): void {
	reviewMenuButton.click();
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRConversation,
	],
	init: initSidebarReviewButton,
}, {
	include: [
		pageDetect.isPRConversation,
	],
	init: enhanceNativeReviewButton,
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

- Open PR (review, approve) https://github.com/refined-github/sandbox/pull/10
- Closed PR (only review) https://github.com/refined-github/sandbox/pull/26
- PRs with your review requested: https://github.com/pulls/review-requested

*/
