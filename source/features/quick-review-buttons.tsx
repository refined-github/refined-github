import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';
import looseParseInt from '../helpers/loose-parse-int';

function init(): false | void {
	const form = select('[action$="/reviews"]')!;
	const radios = select.all('input[type="radio"][name="pull_request_review[event]"]', form);

	if (radios.length === 0) {
		return false;
	}

	const container = select('.form-actions', form)!;

	// Set the default action for cmd+enter to Comment
	if (radios.length > 1) {
		container.append(
			<input
				type="hidden"
				name="pull_request_review[event]"
				value="comment"/>,
		);
	}

	// Generate the new buttons
	for (const radio of radios) {
		const tooltip = radio.parentElement!.getAttribute('aria-label');

		const classes = ['btn btn-sm'];
		if (radio.value === 'comment') {
			classes.push('btn-primary');
		}

		if (tooltip) {
			classes.push('tooltipped tooltipped-nw tooltipped-no-delay');
		}

		container.append(
			<button
				type="submit"
				name="pull_request_review[event]"
				value={radio.value}
				className={classes.join(' ')}
				aria-label={tooltip!}
				disabled={radio.disabled}
			>
				{radio.nextSibling}
			</button>,
		);
	}

	// Comment button must be last; cancel button must be first
	if (radios.length > 1) {
		container.append(select('button[value="comment"]', form)!);
		const cancelReview = select('.review-cancel-button', form);
		if (cancelReview) {
			cancelReview.classList.add('float-left');
			container.prepend(cancelReview);
		}
	}

	// Remove original fields at last to avoid leaving a broken form
	for (const radio of radios) {
		radio.closest('.form-checkbox')!.remove();
	}

	select('[type="submit"]:not([name])', form)!.remove(); // The selector excludes the "Cancel" button

	// This will prevent submission when clicking "Comment" and "Request changes" without entering a comment and no other review comments are pending
	delegate(form, 'button', 'click', ({delegateTarget: {value}}) => {
		const pendingComments = looseParseInt(select('.js-reviews-toggle .js-pending-review-comment-count'));
		const submissionRequiresComment = pendingComments === 0 && (value === 'reject' || value === 'comment');
		select('#pull_request_review_body', form)!.toggleAttribute('required', submissionRequiresComment);
	});

	// Freeze form to avoid duplicate submissions
	form.addEventListener('submit', () => {
		// Delay disabling the fields to let them be submitted first
		setTimeout(() => {
			for (const control of select.all('button, textarea', form)) {
				control.disabled = true;
			}
		});
	});
}

void features.add(__filebasename, {
	include: [
		pageDetect.isPR,
	],
	deduplicate: 'has-rgh-inner',
	init,
});
