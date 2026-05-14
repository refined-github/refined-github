import delegate, {type DelegateEvent} from 'delegate-it';
import React from 'dom-chef';
import elementReady from 'element-ready';
import {isAlteredClick} from 'filter-altered-clicks';
import * as pageDetect from 'github-url-detection';
import {$, $optional} from 'select-dom';

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
import observe, {waitForElement} from '../helpers/selector-observer.js';
import {tooltipped} from '../helpers/tooltip.js';
import {getToken} from '../options-storage.js';

const emojis = ['🚀', '🐿️', '⚡️', '🤌', '🥳', '🥰', '🤩', '🥸', '😎', '🤯', '🚢', '🛫', '🏳️', '🏁'];

// Be careful not to select the "Submit review" button in the dialog
const reviewMenuButtonSelector = 'button[class*="ReviewMenuButton-module__ReviewMenuButton"]';

const openReviewMenuDeepLink = 'review-changes-modal';
const openReviewMenuDeepLinkSelector = `#${openReviewMenuDeepLink}`;

const prFilesChangedTabSelector = 'a#prs-files-anchor-tab';

const isNewFilesChangedExperienceEnabled = (): boolean => $(prFilesChangedTabSelector).href.endsWith('changes');

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

async function openReviewDialogWhenAvailable(): Promise<void> {
	const signal = AbortSignal.timeout(10_000);
	const reviewMenuButton = await waitForElement(reviewMenuButtonSelector, {signal});
	reviewMenuButton!.click();
}

function handleReviewClick(event: DelegateEvent<MouseEvent>): void {
	if (isAlteredClick(event) || !isNewFilesChangedExperienceEnabled()) {
		return;
	}

	event.preventDefault();
	void openReviewDialogWhenAvailable();
	$(prFilesChangedTabSelector).click();
}

function preloadPrFilesTab(): void {
	// Trigger data preloading
	// TODO: Change `$optional` to `$()` once legacy PR files view is removed
	$optional(prFilesChangedTabSelector)?.dispatchEvent(new MouseEvent('mouseover', {bubbles: true}));
}

async function addSidebarReviewButtons(reviewersSection: Element): Promise<void> {
	const quickReview = (
		<span className="text-normal color-fg-muted">
			{'– '}
			{tooltipped(
				{
					label: 'Review now',
					shortcut: 'v',
				},
				<a
					// TODO: Change path to "changes" once Legacy PR files view is removed
					href={`${location.pathname}/files#${openReviewMenuDeepLink}`}
					className="rgh-quick-review btn-link Link--muted Link--inTextBlock"
					data-turbo-frame="repo-content-turbo-frame"
					data-hotkey="v"
					onMouseEnter={preloadPrFilesTab}
				>
					review now
				</a>,
			)}
		</span>
	);

	// Occasionally this button appears before "Reviewers", so let's wait a bit longer
	await delay(300);
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
		tooltipped(
			{label: 'Hold alt to approve without confirmation', direction: 'nw'},
			<button
				type="button"
				className="btn-link Link--muted Link--inTextBlock rgh-quick-approve"
			>
				approve now
			</button>,
		),
	);
}

async function initSidebarReviewButton(signal: AbortSignal): Promise<void> {
	observe('#reviewers-select-menu .discussion-sidebar-heading', addSidebarReviewButtons, {signal});
	delegate('.rgh-quick-approve', 'click', quickApprove, {signal});
	delegate('.rgh-quick-review', 'click', handleReviewClick, {signal});
}

function onReviewRequestedButtonClick(event: DelegateEvent<PointerEvent, HTMLAnchorElement>): void {
	if (isNewFilesChangedExperienceEnabled()) {
		void openReviewDialogWhenAvailable();
		return;
	}

	// TODO: Drop after legacy PR files view is removed
	event.delegateTarget.hash = openReviewMenuDeepLink;
}

function initReviewRequestedButton(signal: AbortSignal): void {
	delegate('section[aria-label="Review Request Banner"] a[type="button"]', 'click', onReviewRequestedButtonClick, {
		capture: true,
		signal,
	});
}

// Legacy PR files view -- TODO: Drop after it is removed
function focusReviewTextarea(event: DelegateEvent<Event, HTMLElement>): void {
	if ('newState' in event && event.newState === 'open') {
		$('textarea', event.delegateTarget).focus();
	}
}

async function initReviewButtonEnhancements(signal: AbortSignal): Promise<void> {
	delegate(openReviewMenuDeepLinkSelector, 'toggle', focusReviewTextarea, {capture: true, signal});

	const reviewDropdownButton = await elementReady([
		reviewMenuButtonSelector,
		'.js-reviews-toggle', // Legacy PR files view -- TODO: Drop after it is removed
	]);
	if (reviewDropdownButton) {
		reviewDropdownButton.dataset.hotkey = 'v';
	}
}

// Legacy PR files view -- TODO: Drop after it is removed
async function openReviewPopup(button: HTMLButtonElement): Promise<void> {
	await delay(100); // The popover appears immediately afterwards in the HTML, observe() might trigger too soon
	(button.popoverTargetElement as HTMLElement).showPopover();
}

function openReviewDialog(reviewMenuButton: HTMLButtonElement): void {
	reviewMenuButton.click();
}

async function initDeepLinking(signal: AbortSignal): Promise<void> {
	observe(reviewMenuButtonSelector, openReviewDialog, {signal});
	// Cannot target the [popover] itself because observe() can't see hidden elements
	observe(`[popovertarget="${openReviewMenuDeepLink}"]`, openReviewPopup, {signal});
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
	init: initReviewRequestedButton,
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
		() => location.hash === openReviewMenuDeepLinkSelector,
		pageDetect.isPRFiles,
	],
	init: initDeepLinking,
});

/*

Test URLs:

- Open PR (review, approve) https://github.com/refined-github/sandbox/pull/10
- Closed PR (only review) https://github.com/refined-github/sandbox/pull/26
- PRs with your review requested: https://github.com/pulls/review-requested

*/
