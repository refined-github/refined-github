import React from 'dom-chef';
import delay from 'delay';
import * as pageDetect from 'github-url-detection';
import delegate from 'delegate-it';
import {$} from 'select-dom';

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
	// Disable entirely on own PRs
	if (getUsername() === $('.author')!.textContent) {
		features.unload(import.meta.url);
		return;
	}

	// Occasionally this button appears before "Reviewers", so let's wait a bit longer
	// Delay by an additional 100 ms to ensure order with `quick-review` 🥹🍝🤌
	await delay(300 + 100);
	reviewersSection.append(
		<span className="text-normal">
			{' – '}<button type="button" className="btn-link Link--muted rgh-quick-approve">approve now</button>
		</span>,
	);
}

async function init(signal: AbortSignal): Promise<void> {
	// Keep detection here to avoid having to wait for DOM-ready
	// TODO: Move to `exclude` after https://github.com/refined-github/github-url-detection/issues/85
	if (pageDetect.isClosedPR()) {
		return;
	}

	await api.expectToken();
	observe('[aria-label="Select reviewers"] .discussion-sidebar-heading', addSidebarReviewButton, {signal});
	delegate('.rgh-quick-approve', 'click', quickApprove, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRConversation,
	],
	init,
});

/*

Test URLs:

https://github.com/refined-github/sandbox/pull/10

*/
