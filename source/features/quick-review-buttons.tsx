import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';

function init(): false | void {
	const form = select('[action$="/reviews"]')!;
	const radios = select.all<HTMLInputElement>('[type="radio"][name="pull_request_review[event]"]', form);

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
				value="comment"/>
		);
	}

	// Generate the new buttons
	for (const radio of radios) {
		const tooltip = radio.parentElement!.getAttribute('aria-label');

		const classes = ['btn btn-sm'];
		if (radio.value === 'approve') {
			classes.push('btn-primary');
		} else if (radio.value === 'reject') {
			classes.push('btn-danger');
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
				aria-label={tooltip ?? undefined}
				disabled={radio.disabled}
			>
				{radio.nextSibling}
			</button>
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
	delegate<HTMLButtonElement>(form, 'button', 'click', ({delegateTarget: {value}}) => {
		const submissionRequiresComment = !select.exists('.review-comment-contents > .is-pending') && (value === 'reject' || value === 'comment');
		select('#pull_request_review_body', form)!.toggleAttribute('required', submissionRequiresComment);
	});

	// Freeze form to avoid duplicate submissions
	form.addEventListener('submit', () => {
		// Delay disabling the fields to let them be submitted first
		setTimeout(() => {
			for (const control of select.all<HTMLButtonElement | HTMLTextAreaElement>('button, textarea', form)) {
				control.disabled = true;
			}
		});
	});
}

features.add({
	id: __filebasename,
	description: 'Simplifies the PR review form: Approve or reject reviews faster with one-click review-type buttons.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/34326942-529cb7c0-e8f3-11e7-9bee-98b667e18a90.png'
}, {
	include: [
		pageDetect.isPR
	],
	init
});
