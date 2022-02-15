import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import onReplacedElement from '../helpers/on-replaced-element';

function addIndicator(button: HTMLElement): void {
	button.classList.add('rgh-draft-pr-indicator');
	const preposition = button.textContent!.includes('Add') ? ' to ' : ' on ';
	button.textContent += preposition + 'draft PR';
}

function init(signal: AbortSignal): void {
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
		void onReplacedElement('#partial-new-comment-form-actions .btn-primary:not(.rgh-draft-pr-indicator)', addIndicator, {runCallbackOnStart: true, signal});
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
