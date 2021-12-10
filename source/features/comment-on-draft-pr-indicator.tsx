import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import onReplacedElement from '../helpers/on-replaced-element.js';

function addIndicator(button: HTMLElement): void {
	const preposition = button.textContent!.includes('Add') ? ' to ' : ' on ';
	button.textContent += preposition + 'draft PR';
}

function init(): void {
	const buttons = select.all([
		'.review-simple-reply-button', // "Add single comment" button
		'.add-comment-label', // "Add review comment" button
		'.start-review-label', // "Start a review" button
	]);
	for (const button of buttons) {
		addIndicator(button);
	}

	if (pageDetect.isPRConversation()) {
		// The button is part of a .js-updatable-content partial
		void onReplacedElement('#partial-new-comment-form-actions .btn-primary', addIndicator, {runCallbackOnStart: true});
	}
}

void features.add(import.meta.url, {
	asLongAs: [
		pageDetect.isDraftPR,
	],
	include: [
		pageDetect.isPRConversation,
		pageDetect.isPRFiles,
	],
	deduplicate: 'has-rgh-inner',
	init,
});
