import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';
import onNewComments from '../github-events/on-new-comments';

function handleClicks(): void {
	const buttonsSingleComment = select.all([
		'.review-simple-reply-button',
		'.add-comment-label' // For when adding a single comment after having started a review
	]);
	for (const element of buttonsSingleComment) {
		element.textContent = 'Add single comment to draft PR';
	}

	const buttonsStartReview = select.all('.start-review-label');
	for (const element of buttonsStartReview) {
		element.textContent = 'Start a review on draft PR';
	}
}

function init(): void {
	let commentButton;
	if (pageDetect.isPRConversation()) {
		commentButton = select('#partial-new-comment-form-actions .btn-primary');
		commentButton!.textContent = 'Comment on draft PR';
	} else if (pageDetect.isPRFiles()) {
		delegate('.diff-table', 'button', 'click', handleClicks);
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.isPRConversation,
		pageDetect.isPRFiles
	],
	exclude: [
		() => !pageDetect.isDraftPR()
	],
	additionalListeners: [
		onNewComments
	],
	init
});
