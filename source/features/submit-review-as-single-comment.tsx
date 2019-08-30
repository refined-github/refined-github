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

// Finds nearby comment field by listening it to its `focus` event.
// Supports multiple threads on same line, split diffs, replies and new threads.
async function getNewCommentField(commentContainer: Element, lineBeingCommentedOn: Element): Promise<HTMLTextAreaElement> {
	const isReplyingToExistingThread = commentContainer.closest('.js-comments-holder')!.childElementCount > 1;
	const listener = oneEvent(lineBeingCommentedOn.parentElement!, 'focusin');
	if (isReplyingToExistingThread) {
		const newCommentContainer = commentContainer.closest('.js-resolvable-thread-contents')!;
		select('.review-thread-reply-button', newCommentContainer)!.click();
	} else {
		const isRightSide = commentContainer.closest('.js-addition');
		(isRightSide ? select.last : select)('.js-add-line-comment', lineBeingCommentedOn)!.click();
	}

	// Hide comment box
	return (await listener).target as HTMLTextAreaElement;
}

async function handleSubmitSingle(event: DelegateEvent): Promise<void> {
	const commentContainer = event.delegateTarget.closest('.js-comment')!;
	const commentText = select<HTMLTextAreaElement>('[name="pull_request_review_comment[body]"]', commentContainer)!.value;
	if (!commentText) {
		reportBug(__featureName__, 'comment not found');
		return;
	}

	// The comments are in a <tr> right after the code
	const lineBeingCommentedOn = commentContainer.closest('tr')!.previousElementSibling!;

	// Use nearby comment box
	const comment = await getNewCommentField(commentContainer, lineBeingCommentedOn);
	const submitButton = select<HTMLButtonElement>('[name="single_comment"]', comment.form!)!;
	const commentForm = comment.closest<HTMLElement>('.inline-comment-form-container')!;

	// Copy comment to new comment box
	insertText(comment.form!.elements['comment[body]'] as HTMLTextAreaElement, commentText);

	// Safely try comment deletion
	try {
		console.log(commentForm);
		commentForm.hidden = true;

		// Delete comment without asking confirmation
		const deleteLink = select<HTMLButtonElement>('[aria-label="Delete comment"]', commentContainer)!;
		deleteLink.removeAttribute('data-confirm');
		deleteLink.click();

		// Wait for the comment to be removed
		await observeOneMutation(lineBeingCommentedOn.parentElement!);

		// Enable form and submit new comment
		submitButton.disabled = false;
		submitButton.click();

		// Wait for the comment to be added
		await observeOneMutation(lineBeingCommentedOn.parentElement!);
		commentForm.hidden = false;
	} catch (error) {
		commentForm.hidden = false;

		// Place comment in console to allow recovery
		console.log('You were trying to sending this comment:');
		console.log(commentText);
		reportBug(__featureName__, 'there was an error sending the comment');
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
	description: 'Adds a button to submit a single PR comment if you mistakenly started a new review.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/60331761-f6394200-99c7-11e9-81c2-c671cba9602a.gif',
	include: [
		features.isPRFiles
	],
	load: features.onAjaxedPages,
	init
});
