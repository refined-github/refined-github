import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import onReplacedElement from '../helpers/on-replaced-element';

function addIndicator(button: HTMLElement) {
	const preposition = button.textContent!.includes('Add') ? ' to ' : ' on ';
	button.textContent += preposition + 'draft PR';
}

function initPRFiles(): void {
	const buttons = select.all([
		'.review-simple-reply-button', // "Add single comment" button
		'.add-comment-label', // "Add review comment" button
		'.start-review-label' // "Start a review" button
	]);
	for (const button of buttons) {
		addIndicator(button);
	}
}

function initConversation(): void {
	// The button is part of a .js-updatable-content partial
	void onReplacedElement('#partial-new-comment-form-actions .btn-primary', addIndicator, true);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isPRFiles
	],
	exclude: [
		() => !pageDetect.isDraftPR()
	],
	init: initPRFiles
}, {
	include: [
		pageDetect.isPRConversation
	],
	exclude: [
		() => !pageDetect.isDraftPR()
	],
	init: initConversation
});
