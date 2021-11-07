import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';
import {CheckIcon, FileDiffIcon} from '@primer/octicons-react';

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
				value="comment"
			/>,
		);
	}

	// "Approve" button must be last
	if (radios.length > 1) {
		radios.push(radios.splice(1, 1)[0]);
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

		const button = (
			<button
				type="submit"
				name="pull_request_review[event]"
				value={radio.value}
				className={classes.join(' ')}
				aria-label={tooltip!}
				disabled={radio.disabled}
			>
				{radio.nextSibling}
			</button>
		);

		if (!radio.disabled && radio.value === 'approve') {
			button.prepend(<CheckIcon className="color-fg-success"/>);
		} else if (!radio.disabled && radio.value === 'reject') {
			button.prepend(<FileDiffIcon className="color-fg-danger"/>);
		}

		container.prepend(button);
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
