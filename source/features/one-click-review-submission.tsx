import React from 'dom-chef';
import select from 'select-dom';
import delegate, {DelegateEvent} from 'delegate-it';
import * as pageDetect from 'github-url-detection';
import {CheckIcon, FileDiffIcon} from '@primer/octicons-react';

import features from '../feature-manager.js';
import looseParseInt from '../helpers/loose-parse-int.js';

function addButtons(radios: HTMLInputElement[]): void {
	const form = radios[0].form!;
	const actionsRow
		= select('.form-actions', form) // TODO: Drop after September 2023
		?? form.closest('.SelectMenu')!.querySelector('.form-actions')!;

	// Set the default action for cmd+enter to Comment
	if (radios.length > 1) {
		form.append(
			<input
				type="hidden"
				name="pull_request_review[event]"
				value="comment"
			/>,
		);
	}

	// Generate the new buttons
	for (const radio of radios) {
		const tooltip = radio.parentElement!.getAttribute('aria-label');

		const classes = ['btn btn-sm rgh-one-click-review-submission'];
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
				// The buttons are no longer inside the form itself; this links the form
				form={form.contains(actionsRow) ? undefined : form.id} // TODO: Drop condition after September 2023
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

		actionsRow.append(button);
	}

	// Remove original fields at last to avoid leaving a broken form
	for (const radio of radios) {
		radio.closest('.form-checkbox')!.remove();
	}

	// The selector excludes the "Cancel" button
	select('[type="submit"]:not([name])', actionsRow)!.remove();
}

let lastSubmission: number | undefined;
function blockDuplicateSubmissions(event: DelegateEvent): void {
	if (lastSubmission && Date.now() - lastSubmission < 1000) {
		event.preventDefault();
		console.log('Duplicate submission prevented');
		return;
	}

	lastSubmission = Date.now();
}

function init(signal: AbortSignal): false | void {
	// Freeze form to avoid duplicate submissions
	delegate('[action$="/reviews"]', 'submit', blockDuplicateSubmissions, {signal});

	// This will prevent submission when clicking "Comment" and "Request changes" without entering a comment and no other review comments are pending
	delegate('button.rgh-one-click-review-submission', 'click', ({delegateTarget: {value, form}}) => {
		const pendingComments = looseParseInt(select('.js-reviews-toggle .js-pending-review-comment-count'));
		const submissionRequiresComment = pendingComments === 0 && (value === 'reject' || value === 'comment');
		select('#pull_request_review_body', form!)!.toggleAttribute('required', submissionRequiresComment);
	}, {signal});

	// `return false` must always be after delegated events are added
	const radios = select.all('input[type="radio"][name="pull_request_review[event]"]');
	if (radios.length === 0) {
		return false;
	}

	addButtons(radios);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPR,
	],
	awaitDomReady: true,
	init,
});

/*

Test URLs

https://github.com/refined-github/sandbox/pull/4/files
https://github.com/refined-github/sandbox/pull/12/files

*/
