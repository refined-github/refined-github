import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import insertText from 'insert-text-textarea';
import delegate, {DelegateEvent} from 'delegate-it';
import features from '../libs/features';
import {observeOneMutation} from '../libs/simplified-element-observer';
import {reportBug} from '../libs/utils';
import oneEvent from '../libs/one-event';

const pendingSelector = '.timeline-comment-label.is-pending';

const getButton = onetime(() => (
	<button className="rgh-submit-single btn-link ml-2 text-gray text-small" type="button">Send now</button>
));

function updateUI(): void {
	// The feature only works with one comment
	const labels = select.all(pendingSelector);
	if (labels.length === 1) {
		labels[0].after(getButton());
	} else {
		getButton().remove();
	}
}

async function handleReviewSubmission(event: DelegateEvent): Promise<void> {
	const container = event.delegateTarget.closest('.line-comments')!;
	await observeOneMutation(container);
	if (select.exists(pendingSelector, container)) {
		updateUI();
	}
	// If no label is found, "Add single comment" was clicked
}

async function sendNow(commentContainer: Element, commentText: string): Promise<void> {
	const lineBeingCommentedOn = commentContainer.closest('tr')!.previousElementSibling!; // The comments are in a <tr> right after the code
	let formHolder;

	// Use nearby comment box. "Open" it to make it functional but keep it hidden from the user
	const isReplyingToExistingThread = commentContainer.closest('.js-comments-holder')!.childElementCount > 1;
	if (isReplyingToExistingThread) {
		const newCommentContainer = commentContainer.closest('.js-resolvable-thread-contents')!;
		select('.review-thread-reply-button', newCommentContainer)!.click();
		select('.open', newCommentContainer)!.classList.remove('open');
		formHolder = newCommentContainer;
	} else {
		// The whole comment area may have been removed.

		// Comment box is focused after being inserted/shown. This event helps us find its position in the dom
		const listener = oneEvent(lineBeingCommentedOn.parentElement!, 'focusin');
		const isRightSide = commentContainer.closest('.js-addition');
		(isRightSide ? select.last : select)<HTMLButtonElement>('.js-add-line-comment', lineBeingCommentedOn)!.click();

		// Hide comment box
		const {target} = await listener;
		formHolder = (target as HTMLTextAreaElement).closest('.inline-comment-form-container') as HTMLElement;
		formHolder.hidden = true;
	}

	// Add comment to new comment box
	insertText(
		select<HTMLTextAreaElement>('[name="comment[body]"]', formHolder)!,
		commentText
	);

	// Delete comment without asking confirmation
	const deleteLink = select<HTMLButtonElement>('[aria-label="Delete comment"]', commentContainer)!;
	deleteLink.removeAttribute('data-confirm');
	deleteLink.click();

	// Wait for the comment to be removed
	await observeOneMutation(lineBeingCommentedOn.parentElement!);

	const submitButton = select<HTMLButtonElement>('[name="single_comment"]', formHolder)!;
	submitButton.disabled = false; // This should be enabled by GitHub, but sometimes the UI doesn't update in time
	submitButton.click();
}

async function handleSubmitSingle(event: DelegateEvent): Promise<void> {
	const commentContainer = event.delegateTarget.closest('.js-comment')!;
	const commentText = select<HTMLTextAreaElement>('[name="pull_request_review_comment[body]"]', commentContainer)!.value;
	if (!commentText) {
		reportBug(__featureName__, 'comment not found');
		return;
	}

	// Place comment in console for safety
	console.log(`Refined GitHub: \`${__featureName__}\` sending this comment:`);
	console.log(commentText);

	try {
		await sendNow(commentContainer, commentText);
	} catch (error) {
		alert('There was an error sending the comment. If it was already deleted, you can find it in the browser console.');
		reportBug(__featureName__, error.message);
		console.error(error);
	}
}

function init(): void {
	delegate('#files', '[action$="/review_comment/create"]', 'submit', handleReviewSubmission);
	delegate('#files', '.rgh-submit-single', 'click', handleSubmitSingle);
	updateUI();
}

features.add({
	id: __featureName__,
	description: 'Submit a single PR comment if you mistakenly started a new review',
	include: [
		features.isPRFiles
	],
	load: features.onAjaxedPages,
	init
});
