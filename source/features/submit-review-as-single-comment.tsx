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
	const isRightSide = commentContainer.closest('.js-addition');

	const deleteLink = select<HTMLButtonElement>('[aria-label="Delete comment"]', commentContainer)!;
	deleteLink.removeAttribute('data-confirm');
	deleteLink.click();
	let formHolder;

	if (isReplyingToExistingThread) {
		// Only one comment is being removed
		await observeOneMutation(commentContainer.parentElement!);

		// Open reply box, but keep it hidden
		select('.review-thread-reply-button', newCommentContainer)!.click();
		select('.open', newCommentContainer)!.classList.remove('open');
		formHolder = newCommentContainer;
	} else {
		// The whole thread is being removed
		await observeOneMutation(lineBeingCommentedOn.parentElement!);

		// Open reply box, but keep it hidden
		const listener = oneEvent(lineBeingCommentedOn.parentElement!, 'focusin');
		(isRightSide ? select.last : select)<HTMLButtonElement>('.js-add-line-comment', lineBeingCommentedOn)!.click();
		const {target} = await listener;
		formHolder = (target as HTMLTextAreaElement).closest('.inline-comment-form-container') as HTMLElement;
		formHolder.hidden = true;
	}

	insertText(
		select<HTMLTextAreaElement>('[name="comment[body]"]', formHolder)!,
		commentText
	);
	const submitButton = select<HTMLButtonElement>('[name="single_comment"]', formHolder)!;
	submitButton.disabled = false; // This should be enabled by GitHub, but sometimes the UI doesn't update in time
	submitButton.click();
}

async function handleSubmitSingle({delegateTarget}: DelegateEvent): Promise<void> {
	const commentContainer = delegateTarget.closest('.js-comment')!;

	const commentText = select<HTMLTextAreaElement>('[name="pull_request_review_comment[body]"]', commentContainer)!.value;

	if (!commentText) {
		reportBug(__featureName__, 'comment not found');
		return;
	}

	// Place comment in console for safety
	console.log(`Refined GitHub: \`${__featureName__}\` sending this comment:`);
	console.log(commentText);
	try {
		await sendNow(commentContainer, delegateTarget, commentText);
	} catch (error) {
		alert('There was an error sending the comment. If it was already deleted, you can find it in the browser console.');
		reportBug(__featureName__, error.message);
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
