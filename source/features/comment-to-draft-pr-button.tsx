import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';
import onNewComments from '../github-events/on-new-comments';

function handleClicks(): void {
	const buttonsSingleComment = select.all([
		'table:not([style="display: none"]) .review-simple-reply-button',
		'table:not([style="display: none"]) .add-comment-label' // For when adding a single comment after having started a review
	]);
	for (const element of buttonsSingleComment) {
		element.innerHTML = ' Add single comment to Draft PR ';
	}

	const buttonsStartReview = select.all('table:not([style="display: none"]) .start-review-label');
	for (const element of buttonsStartReview) {
		element.innerHTML = ' Start a review to Draft PR ';
	}
}

function init(): void {
	let commentButton;
	if (pageDetect.isPRConversation()) {
		commentButton = select('#partial-new-comment-form-actions .btn-primary');
		commentButton!.innerHTML = 'Comment to Draft PR';
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
		() => !pageDetect.isDraftPR
	],
	additionalListeners: [
		onNewComments
	],
	init
});
