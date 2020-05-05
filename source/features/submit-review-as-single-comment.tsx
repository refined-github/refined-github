import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import delegate from 'delegate-it';
import * as textFieldEdit from 'text-field-edit';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';
import {observeOneMutation} from '../libs/simplified-element-observer';
import {logError} from '../libs/utils';
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

async function handleReviewSubmission(event: delegate.Event): Promise<void> {
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

	// TODO: this is wrong. `target` is a button. Maybe instead of listening to `focusin` it should just use select or elementReady
	return (await listener).target as HTMLTextAreaElement;
}

async function handleSubmitSingle(event: delegate.Event): Promise<void> {
	const commentContainer = event.delegateTarget.closest('.js-comment')!;
	const commentText = select<HTMLTextAreaElement>('[name="pull_request_review_comment[body]"]', commentContainer)!.value;
	if (!commentText) {
		alert('Error: Comment not found and not submitted. More info in the console.');
		logError(__filebasename, 'Comment not found');
		return;
	}

	// The comments are in a <tr> right after the code
	const lineBeingCommentedOn = commentContainer.closest('tr')!.previousElementSibling!;

	// Use nearby comment box
	const comment = await getNewCommentField(commentContainer, lineBeingCommentedOn);
	const submitButton = select<HTMLButtonElement>('[name="single_comment"]', comment.form!)!;
	const commentForm = comment.closest<HTMLElement>('.inline-comment-form-container')!;

	// Copy comment to new comment box
	const newComment = select<HTMLTextAreaElement>('[name="comment[body]"]', commentForm)!;
	textFieldEdit.insert(newComment, commentText);

	// Safely try comment deletion
	try {
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
		alert('There was an error sending the comment. More info in the console.');
		console.log('You were trying to sending this comment:');
		console.log(commentText);
		logError(__filebasename, error);
	}
}

function init(): void {
	delegate(document, '#files [action$="/review_comment/create"]', 'submit', handleReviewSubmission);
	delegate(document, '.rgh-submit-single', 'click', handleSubmitSingle);
	updateUI();
}

features.add({
	id: __filebasename,
	description: 'Adds a button to submit a single PR comment if you mistakenly started a new review.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/60331761-f6394200-99c7-11e9-81c2-c671cba9602a.gif'
}, {
	include: [
		pageDetect.isPRFiles
	],
	init
});
