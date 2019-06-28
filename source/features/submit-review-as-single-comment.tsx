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
		(isRightSide ? select.last : select)<HTMLButtonElement>('.js-add-line-comment', lineBeingCommentedOn)!.click();
	}

	// Hide comment box
	return (await listener).target as HTMLTextAreaElement;
}

async function sendNow(commentContainer: Element, commentText: string): Promise<void> {
	// The comments are in a <tr> right after the code
	const lineBeingCommentedOn = commentContainer.closest('tr')!.previousElementSibling!;

	// Use nearby comment box
	const comment = await getNewCommentField(commentContainer, lineBeingCommentedOn);
	comment.disabled = true;

	// Copy comment to new comment box
	insertText(comment.form!.elements['comment[body]'] as HTMLTextAreaElement, commentText);

	// Delete comment without asking confirmation
	const deleteLink = select<HTMLButtonElement>('[aria-label="Delete comment"]', commentContainer)!;
	deleteLink.removeAttribute('data-confirm');
	deleteLink.click();

	// Wait for the comment to be removed
	await observeOneMutation(lineBeingCommentedOn.parentElement!);

	// Enable form and submit new comment
	const submitButton = select<HTMLButtonElement>('[name="single_comment"]', comment.form!)!;
	comment.disabled = false;
	submitButton.disabled = false;
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
