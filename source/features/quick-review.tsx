import React from 'dom-chef';
import delay from 'delay';
import {$} from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import delegate, {DelegateEvent} from 'delegate-it';

import api from '../github-helpers/api.js';
import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import showToast from '../github-helpers/toast.js';
import {getConversationNumber, getUsername} from '../github-helpers/index.js';
import {randomArrayItem} from '../helpers/math.js';

const emojis = [...'🚀✅🐿️⚡️🤌🥳🥰🤩🥸😎🤯🚢🛫🏳️🏁'];

async function quickApprove(): Promise<void> {
	const approval = prompt('Approve instantly? You can add a custom message or leave empty');
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
}

async function addSidebarReviewButton(reviewersSection: Element): Promise<void> {
	const reviewFormUrl = new URL(location.href);
	reviewFormUrl.pathname += '/files';
	reviewFormUrl.hash = 'review-changes-modal';

	// Occasionally this button appears before "Reviewers", so let's wait a bit longer
	await delay(300);
	const quickReview = (
		<span className="text-normal color-fg-muted">
			– <a href={reviewFormUrl.href} className="btn-link Link--muted" data-hotkey="v" data-turbo-frame="repo-content-turbo-frame">review now</a>
		</span>
	);

	reviewersSection.append(quickReview);

	// Can't approve own PRs and closed PRs
	// API required for this action
	if (getUsername() === $('.author')!.textContent || pageDetect.isClosedPR() || !(await api.getToken())) {
		return;
	}

	quickReview.append(
		' – ',
		<button type="button" className="btn-link Link--muted rgh-quick-approve">approve now</button>
	);
}

async function initSidebarReviewButton(signal: AbortSignal): Promise<void> {
	observe('[aria-label="Select reviewers"] .discussion-sidebar-heading', addSidebarReviewButton, {signal});
	delegate('.rgh-quick-approve', 'click', quickApprove, {signal});
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
