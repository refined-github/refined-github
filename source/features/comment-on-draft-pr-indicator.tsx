import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

function addIndicator(button: HTMLElement): void {
	const preposition = button.textContent.includes('Add') ? ' to ' : ' on ';
	button.textContent += preposition + 'draft PR';
}

function init(signal: AbortSignal): void {
	observe([
		'.review-simple-reply-button', // "Add single comment" button
		'.add-comment-label', // "Add review comment" button
		'.start-review-label', // "Start a review" button
	], addIndicator, {signal});
}

void features.add(import.meta.url, {
	asLongAs: [
		pageDetect.isDraftPR,
	],
	include: [
		pageDetect.isPRConversation,
		pageDetect.isPRFiles,
	],
	init,
});
