import {mount} from 'svelte';
import delegate, {type DelegateEvent} from 'delegate-it';
import elementReady from 'element-ready';
import filterAlteredClicks from 'filter-altered-clicks';
import * as pageDetect from 'github-url-detection';
import {$} from 'select-dom';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import {
	getConversationNumber,
	scrollIntoViewIfNeeded,
	triggerConversationUpdate,
} from '../github-helpers/index.js';
import showToast from '../github-helpers/toast.js';
import delay from '../helpers/delay.js';
import {randomArrayItem} from '../helpers/math.js';
import observe, {waitForElement} from '../helpers/selector-observer.js';
import QuickReviewComponent from './quick-review.svelte';

const emojis = ['🚀', '🐿️', '⚡️', '🤌', '🥳', '🥰', '🤩', '🥸', '😎', '🤯', '🚢', '🛫', '🏳️', '🏁'];

// Be careful not to select the "Submit review" button in the dialog
const reviewMenuButtonSelector = 'button[class*="ReviewMenuButton-module__ReviewMenuButton"]';
const openReviewMenuDeepLink = 'review-changes-modal';
const openReviewMenuDeepLinkSelector = `#${openReviewMenuDeepLink}`;
const prFilesChangedTabSelector = 'a#prs-files-anchor-tab';

const isOldPrFiles = (): boolean => $(prFilesChangedTabSelector).href.endsWith('files');

async function quickApprove(event: MouseEvent): Promise<void> {
	const approval = event.altKey ? '' : prompt('Approve instantly? You can add a custom message or leave empty');
	if (approval === null) {
		return;
	}

	const call = api.v3uncached(`pulls/${getConversationNumber()!}/reviews`, {
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

async function openReviewDialogWhenAvailable(event: MouseEvent): Promise<void> {
	event.preventDefault();
	$(prFilesChangedTabSelector).click();

	const signal = AbortSignal.timeout(10_000);
	const reviewMenuButton = await waitForElement(reviewMenuButtonSelector, {signal});
	reviewMenuButton!.click();
}

function preloadPrFilesTab(): void {
	$(prFilesChangedTabSelector).dispatchEvent(new MouseEvent('mouseover', {bubbles: true}));
}

async function addButtons(reviewersSection: Element): Promise<void> {
	// Occasionally this button appears before "Reviewers", so let's wait a bit longer
	await delay(300);

	mount(QuickReviewComponent, {
		target: reviewersSection,
		props: isOldPrFiles()
			? {
				onApprove: quickApprove,
			}
			: {
				onReview: filterAlteredClicks(openReviewDialogWhenAvailable),
				onApprove: quickApprove,
				onPreload: preloadPrFilesTab,
			},
	});
}

// TODO [2027-01-01]: Drop after the legacy PR files view is removed
function focusReviewTextarea(event: DelegateEvent<Event, HTMLElement>): void {
	if ('newState' in event && event.newState === 'open') {
		$('textarea', event.delegateTarget).focus();
	}
}

async function initReviewButtonEnhancements(signal: AbortSignal): Promise<void> {
	delegate(openReviewMenuDeepLinkSelector, 'toggle', focusReviewTextarea, {capture: true, signal});

	const reviewDropdownButton = await elementReady([
		reviewMenuButtonSelector,
		// TODO [2027-01-01]: Drop after the legacy PR files view is removed
		'.js-reviews-toggle',
	]);
	if (reviewDropdownButton) {
		reviewDropdownButton.dataset.hotkey = 'v';
	}
}

// TODO [2027-01-01]: Drop after legacy PR files view is removed
async function openReviewPopup(button: HTMLButtonElement): Promise<void> {
	await delay(100); // The popover appears immediately afterwards in the HTML, observe() might trigger too soon
	(button.popoverTargetElement as HTMLElement).showPopover();
}

function openReviewDialog(reviewMenuButton: HTMLButtonElement): void {
	reviewMenuButton.click();
}

async function initAutoOpenPopup(signal: AbortSignal): Promise<void> {
	// TODO [2027-01-01]: Drop after legacy PR files view is removed
	observe(reviewMenuButtonSelector, openReviewDialog, {signal, once: true});

	// Cannot target the [popover] itself because observe() can't see hidden elements
	observe(`[popovertarget="${openReviewMenuDeepLink}"]`, openReviewPopup, {signal, once: true});
}

async function init(signal: AbortSignal): Promise<void> {
	observe('[aria-label="Select reviewers"] .discussion-sidebar-heading:not(#collapsible-reviewers-without-write)', addButtons, {signal});
}

void features.add(import.meta.url, {
	shortcuts: {
		v: 'Review PR',
	},
	include: [
		pageDetect.isPRConversation,
	],
	init,
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
	init: initAutoOpenPopup,
});

/*

Test URLs:

- Open PR (review, approve) https://github.com/refined-github/sandbox/pull/10
- Closed PR (only review) https://github.com/refined-github/sandbox/pull/26
- PRs with your review requested: https://github.com/pulls/review-requested

*/
