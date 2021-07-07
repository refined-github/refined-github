import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import onReplacedElement from '../helpers/on-replaced-element';

function initPRFiles(): void {
	const buttonsSingleComment = select.all([
		'.review-simple-reply-button',
		'.add-comment-label' // For when adding a single comment after having started a review
	]);
	for (const element of buttonsSingleComment) {
		element.textContent += ' to draft PR';
	}

	for (const element of select.all('.start-review-label')) {
		element.textContent += ' on draft PR';
	}
}

function initConversation(): void {
	// The button is part of a .js-updatable-content partial
	onReplacedElement('#partial-new-comment-form-actions .btn-primary', commentButton => {
		commentButton.textContent += ' on draft PR';
	});
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
