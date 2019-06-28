import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import insertText from 'insert-text-textarea';
import delegate, {DelegateEvent} from 'delegate-it';
import features from '../libs/features';
import {observeOneMutation} from '../libs/simplified-element-observer';

const pendingSelector = '.timeline-comment-label.is-pending';

const getButton = onetime(() => (
	<button className="rgh-submit-single btn-link ml-2 text-gray text-small" type="button">Send now</button>
));

async function handleReviewSubmission(event: DelegateEvent): Promise<void> {
	const container = event.delegateTarget.closest('.line-comments')!;

	await observeOneMutation(container, {
		childList: true,
		subtree: true
	});

	const pendingLabel = select(pendingSelector, container);
	if (!pendingLabel) {
		return; // "Add single comment" was clicked
	}

	// The feature only works with one comment
	if (select.all(pendingSelector).length === 1) {
		pendingLabel.after(getButton());
	} else {
		getButton().remove();
	}
}

async function sendNow(commentContainer: Element, delegateTarget: Element, commentText: string): Promise<void> {
	const newCommentContainer = delegateTarget.closest('.js-resolvable-thread-contents')!;
	const isReplyingToExistingThread = commentContainer.closest('.js-comments-holder')!.childElementCount > 1;
	const lineBeingCommentedOn = newCommentContainer.closest('tr')!.previousElementSibling!;

	const deleteLink = select<HTMLButtonElement>('[aria-label="Delete comment"]', commentContainer)!;
	deleteLink.removeAttribute('data-confirm');
	deleteLink.click();

	if (isReplyingToExistingThread) {
		// Only one comment is being removed
		await observeOneMutation(commentContainer.parentElement!);

		// Open reply box, but keep it hidden
		select('.review-thread-reply-button', newCommentContainer)!.click();
		select('.open', newCommentContainer)!.classList.remove('open');
	} else {
		// The whole thread is being removed
		await observeOneMutation(lineBeingCommentedOn.parentElement!, {
			childList: true,
			subtree: true
		});

		// Open reply box, but keep it hidden
		select<HTMLButtonElement>('.js-add-single-line-comment', lineBeingCommentedOn)!.click();
		select('.js-inline-comment-form-container.open', lineBeingCommentedOn.nextElementSibling!)!.hidden = true;
	}

	const formHolder = isReplyingToExistingThread ? newCommentContainer : select.last('.js-inline-comment-form', lineBeingCommentedOn.nextElementSibling!);

	const field = select<HTMLTextAreaElement>('[name="comment[body]"]', formHolder!)!;
	insertText(field, commentText);
	const submitButton = select<HTMLButtonElement>('[name="single_comment"]', field.form!)!;
	submitButton.click();
}
async function handleSubmitSingle({delegateTarget}: DelegateEvent): Promise<void> {
	const commentContainer = delegateTarget.closest('.js-comment')!;

	const commentText = select<HTMLTextAreaElement>('[name="pull_request_review_comment[body]"]', commentContainer)!.value;

	if (!commentText) {
		alert('Refined GitHub: new bug. Can’t find the comment');
		return;
	}

	// Place comment in console for safety
	console.log('Refined GitHub: `submit-review-as-single-comment` sending this comment:');
	console.log(commentText);
	try {
		await sendNow(commentContainer, delegateTarget, commentText);
	} catch (error) {
		alert('Refined GitHub: there was an error sending the comment. If it was already deleted, you can find it in the browser console.');
		console.error(error);
	}
}

function init(): void {
	delegate(
		'#files',
		// TODO: change to `submit` event
		'[action$="/review_comment/create"]',
		'submit',
		handleReviewSubmission
	);
	delegate(
		'#files',
		'.rgh-submit-single',
		'click',
		handleSubmitSingle
	);

	const labels = select.all(pendingSelector);
	if (labels.length === 1) {
		labels[0].after(getButton());
	}
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
