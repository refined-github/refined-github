import React from 'dom-chef';
import delay from 'delay';
import {$} from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import delegate from 'delegate-it';

import api from '../github-helpers/api.js';
import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import showToast from '../github-helpers/toast.js';
import {getConversationNumber} from '../github-helpers/index.js';
import {randomArrayItem} from '../helpers/math.js';

const emojis = [...'🚀✅🐿️⚡️🤌🥳🥰🤩🥸😎🤯🚢🛫🏳️🏁'];

async function quickApprove(): Promise<void> {
	const approval = prompt('Approve instantly? You can add a custom message or leave empty');
	if (approval === null) {
		return;
	}

	const call = api.v3(`pulls/${getConversationNumber()!}/review`, {
		method: 'POST',
		body: {approval},
	});

	await showToast(call, {
		message: 'Approving…',
		doneMessage: randomArrayItem(emojis) + ' Approved',
	});
}

async function addSidebarReviewButton(reviewersSection: Element): Promise<void> {
	// Occasionally this button appears before "Reviewers", so let's wait a bit longer
	// Delay by an additional 300 ms to ensure order with `quick-review` 🥹🍝🤌
	await delay(300 + 300);
	reviewersSection.append(
		<span className="text-normal">
			– <button type="button" className="btn-link Link--muted rgh-quick-approve">approve now</button>
		</span>,
	);
}

async function init(signal: AbortSignal): Promise<void> {
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
