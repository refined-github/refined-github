import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import delegate from 'delegate-it';
import oneEvent from 'one-event';
import oneMutation from 'one-mutation';
import * as pageDetect from 'github-url-detection';
import * as textFieldEdit from 'text-field-edit';

import features from '.';

const pendingSelector = '.timeline-comment-label.is-pending';

const getButton = onetime(() => (
	<button className="rgh-submit-single btn-link ml-2 color-text-secondary color-fg-muted text-small" type="button">Send now</button>
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

async function handleReviewSubmission(event: delegate.Event): Promise<void> {
	const container = event.delegateTarget.closest('.line-comments')!;
	await oneMutation(container, {childList: true, subtree: true}); // TODO: subtree might not be necessary anywhere on the page
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

	// TODO: this is wrong. `target` is a button. Maybe instead of listening to `focusin` it should just use select or elementReady
	return (await listener).target as HTMLTextAreaElement;
}

async function handleSubmitSingle(event: delegate.Event): Promise<void> {
	const commentContainer = event.delegateTarget.closest('.js-comment')!;
	const commentText = select('textarea[name="pull_request_review_comment[body]"]', commentContainer)!.value;
	if (!commentText) {
		alert('Error: Comment not found and not submitted. More info in the console.');
		features.log.error(__filebasename, 'Comment not found');
		return;
	}

	// The comments are in a <tr> right after the code
	const lineBeingCommentedOn = commentContainer.closest('tr')!.previousElementSibling!;

	// Use nearby comment box
	const comment = await getNewCommentField(commentContainer, lineBeingCommentedOn);
	const submitButton = select('button[name="single_comment"]', comment.form!)!;
	const commentForm = comment.closest<HTMLElement>('.inline-comment-form-container')!;

	// Copy comment to new comment box
	const newComment = select('textarea[name="comment[body]"]', commentForm)!;
	textFieldEdit.insert(newComment, commentText);

	// Safely try comment deletion
	try {
		commentForm.hidden = true;

		// Delete comment without asking confirmation
		const deleteLink = select('button[aria-label="Delete comment"]', commentContainer)!;
		deleteLink.removeAttribute('data-confirm');
		deleteLink.click();

		// Wait for the comment to be removed
		await oneMutation(lineBeingCommentedOn.parentElement!, {childList: true, subtree: true});

		// Enable form and submit new comment
		submitButton.disabled = false;
		submitButton.click();

		// Wait for the comment to be added
		await oneMutation(lineBeingCommentedOn.parentElement!, {childList: true, subtree: true});
		commentForm.hidden = false;
	} catch (error: unknown) {
		commentForm.hidden = false;

		// Place comment in console to allow recovery
		alert('There was an error sending the comment. More info in the console.');
		console.log('You were trying to sending this comment:');
		console.log(commentText);
		features.log.error(__filebasename, error);
	}
}

function init(): void {
	delegate(document, '#files [action$="/review_comment/create"]', 'submit', handleReviewSubmission);
	delegate(document, '.rgh-submit-single', 'click', handleSubmitSingle);
	updateUI();
}

void features.add(__filebasename, {
	include: [
		pageDetect.isPRFiles,
	],
	deduplicate: 'has-rgh-inner',
	init,
});
