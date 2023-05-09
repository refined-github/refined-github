import React from 'dom-chef';
import select from 'select-dom';
import delegate, {DelegateEvent} from 'delegate-it';
import * as pageDetect from 'github-url-detection';
import {CheckIcon, FileDiffIcon} from '@primer/octicons-react';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

function replaceCheckboxes(originalSubmitButton: HTMLButtonElement): void {
	const form = originalSubmitButton.form!;
	const actionsRow = originalSubmitButton.closest('.form-actions')!;
	const formAttribute = originalSubmitButton.getAttribute('form')!;

	// Do not use `select.all` because elements can be outside `form`
	// `RadioNodeList` is dynamic, so we need to make a copy
	const radios = [...form.elements.namedItem('pull_request_review[event]') as RadioNodeList] as HTMLInputElement[];

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
				form={formAttribute}
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

	originalSubmitButton.remove();
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

function init(signal: AbortSignal): void {
	// The selector excludes the "Cancel" button
	observe('#review-changes-modal [type="submit"]:not([name])', replaceCheckboxes, {signal});
	delegate('#review-changes-modal form', 'submit', blockDuplicateSubmissions, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRFiles,
	],
	awaitDomReady: true,
	init,
});

/*

Test URLs

https://github.com/refined-github/sandbox/pull/4/files
https://github.com/refined-github/sandbox/pull/12/files

*/
