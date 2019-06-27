import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import delegate, {DelegateEvent} from 'delegate-it';
import {poll} from '../libs/utils';
import features from '../libs/features';

const pendingSelector = '.timeline-comment-label.is-pending';

const getButton = onetime(() => (
	<button className="rgh-submit-single btn-link ml-2 text-gray text-small" type="button">Send now</button>
));

async function handleReviewSubmission(event: DelegateEvent): Promise<void> {
	const container = event.delegateTarget.closest('.line-comments')!;

	// TODO: maybe replace with MutationObserver
	const pendingLabel = await poll(() => {
		return select(pendingSelector, container);
	}, 500);

	// The feature only works with one comment
	if (select.all(pendingSelector).length > 1) {
		getButton().remove();
		return;
	}

	pendingLabel!.after(getButton());
}

function handleSubmitSingle({delegateTarget}: DelegateEvent): void {
	const commentContainer = delegateTarget.closest('.js-comment')!;
	const newCommentContainer = delegateTarget.closest('.js-resolvable-thread-contents')!;

	const commentText = select<HTMLTextAreaElement>('[name="pull_request_review_comment[body]"]', commentContainer)!.value;

	if (!commentText) {
		throw new Error('Something’s broken'); // TODO
	}

	const deleteLink = select<HTMLButtonElement>('[aria-label="Delete comment"]', commentContainer)!;
	deleteLink.removeAttribute('data-confirm');
	deleteLink.click();

	// TODO: replace with MutationObserver
	setTimeout(() => {
		// Open form
		select('.js-toggle-inline-comment-form')!.click();
		const field = select<HTMLButtonElement>('[name="comment[body]"]', newCommentContainer)!;
		field.value = commentText;
		select('[name="single_comment"]', field.form!)!.click();
	}, 2000);
}

function init(): void {
	delegate(
		'#files',
		// TODO: change to `submit` event
		'[action$="/review_comment/create"] [type="submit"]:not(.review-simple-reply-button)',
		'click',
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
