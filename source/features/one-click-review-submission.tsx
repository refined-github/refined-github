import React from 'dom-chef';
import delegate, {type DelegateEvent} from 'delegate-it';
import * as pageDetect from 'github-url-detection';
import CommentIcon from 'octicons-plain-react/Comment';
import CheckIcon from 'octicons-plain-react/Check';
import FileDiffIcon from 'octicons-plain-react/FileDiff';
import {$, $$} from 'select-dom/strict.js';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import {assertNodeContent} from '../helpers/dom-utils.js';

function replaceCheckboxes(originalSubmitButton: HTMLButtonElement): void {
	const form = originalSubmitButton.form!;
	const actionsRow = originalSubmitButton.closest('.Overlay-footer');
	const formAttribute = originalSubmitButton.getAttribute('form')!;

	// Do not use `$$` because elements can be outside `form`
	// `RadioNodeList` is dynamic, so we need to make a copy
	const radios = [...form.elements.namedItem('pull_request_review[event]') as RadioNodeList] as HTMLInputElement[];
	if (radios.length === 0) {
		throw new Error('Could not find radio buttons');
		return;
	}

	// Set the default action for cmd+enter to Comment
	if (radios.length > 1) {
		form.prepend(
			<input
				type="hidden"
				name="pull_request_review[event]"
				value="comment"
			/>,
		);
	}

	if (actionsRow) {
		actionsRow.prepend(<span className="spacer.gif ml-auto" />);
		radios.reverse();
	}

	// Generate the new buttons
	for (const radio of radios) {
		const parent = radio.parentElement!;
		const labelElement = (
			parent.querySelector('label')
			?? radio.nextSibling! // TODO: Remove after April 2025
		);
		const tooltip = $([
			'p', // TODO: Remove after April 2025
			'.FormControl-caption',
		], parent).textContent.trim().replace(/\.$/, '');
		assertNodeContent(labelElement, /^(Approve|Request changes|Comment)$/);

		const classes = ['btn btn-sm'];

		if (tooltip) {
			classes.push('tooltipped tooltipped-nw tooltipped-no-delay');
		}

		const button = (
			<button
				type="submit"
				name="pull_request_review[event]"
				// Old version of GH don't nest the submit button inside the form, so must be linked manually. Issue #6963.
				form={formAttribute}
				value={radio.value}
				className={classes.join(' ')}
				aria-label={tooltip}
				disabled={radio.disabled}
			>
				{labelElement.textContent}
			</button>
		);

		if (!radio.disabled && radio.value === 'approve') {
			button.prepend(<CheckIcon className="color-fg-success" />);
		} else if (!radio.disabled && radio.value === 'reject') {
			button.prepend(<FileDiffIcon className="color-fg-danger" />);
		}

		if (actionsRow) {
			actionsRow.prepend(button);
		} else {
			// TODO: For GHE. Remove after June 2025
			const legacyActionsRow = originalSubmitButton.closest('.form-actions')!;
			legacyActionsRow.append(button);
		}
	}

	// Remove original fields at last to avoid leaving a broken form
	const fieldset = radios[0].closest('fieldset');

	if (fieldset) {
		fieldset.remove();
	} else {
		// To retain backwards compatibility with older GHE versions, remove any radios not within a fieldset. Issue #6963.
		for (const radio of radios) {
			radio.closest('.form-checkbox')!.remove();
		}
	}

	originalSubmitButton.remove();
}

const reviewButtonSelector = '[class*="ReviewMenuButton-module__SubmitReviewButton"]';
const cancelButtonSelector = `:not(${reviewButtonSelector})`;

function replaceCheckboxesReact({delegateTarget}: DelegateEvent): void {
	// Exclude the "Submit comments" button
	if (delegateTarget.textContent !== 'Submit review') {
		return;
	}

	const dialog = $('div[role="dialog"]');
	// Desktop layout first, then mobile layout
	const reviewBody = $(
		['[class^="ReviewMenuButton-module__AnchoredReviewBody"]', '[class^="prc-Dialog-Body"]'],
		dialog,
	);
	const radioGroup = $('[class*="prc-CheckboxOrRadioGroup-GroupFieldset"]', reviewBody);
	const actionRow = reviewBody.nextElementSibling ?? $('[class^="prc-Dialog-Footer"]', dialog);

	const choices: [HTMLInputElement, string, string][] = $$(
		'[class^="prc-FormControl-ControlHorizontalLayout"]',
		radioGroup,
	).map(horizontalControl => {
		const radioButton = $('input', horizontalControl);
		if (radioButton.value === 'comment') {
			// Select the "Comment" option to check if the original submit button is enabled later
			radioButton.click();
		}
		const description = $('[class^="ReviewMenu-module__RadioText"]', horizontalControl);
		// The reason why the radio button is disabled
		const maybeTooltip = horizontalControl.parentElement!;
		const tooltipText = (
			maybeTooltip.role === 'tooltip' ? maybeTooltip.ariaLabel! : description.textContent
		).replace(/.$/, '');
		const label = description.previousElementSibling!;
		return [radioButton, label.textContent, tooltipText];
	});

	const buttons: Element[] = choices.map(([radioButton, label, tooltip], index) => {
		let icon: React.JSX.Element;
		let isDisabled = radioButton.disabled;
		switch (radioButton.value) {
			case 'comment': {
				icon = <CommentIcon />;
				// radioButton.disabled for the "Comment" option is always false
				// Check the disabled state of the original submit button, which depends on whether the comment textarea is empty
				isDisabled = $(`button${reviewButtonSelector}`, actionRow).disabled;
				break;
			}
			case 'approve': {
				icon = <CheckIcon className="color-fg-success" />;
				break;
			}
			case 'request changes': {
				icon = <FileDiffIcon className="color-fg-danger" />;
				break;
			}
			default: {
				throw new Error('Unknown radio button');
			}
		}

		return (
			<button
				className={
					`Button--${index === 0 ? 'primary' : 'secondary'} `
					+ 'Button--medium Button tooltipped tooltipped-nw tooltipped-no-delay'
				}
				aria-label={tooltip}
				disabled={isDisabled}
				onClick={() => {
					radioButton.click();
					submitReview();
				}}
			>
				<span className="Button-content">
					<span className="Button-visual Button-leadingVisual">{icon}</span>
					<span className="Button-label">{label}</span>
				</span>
			</button>
		);
	});

	function submitReview(): void {
		for (const button of buttons) button.setAttribute('disabled', 'true');
		$(`button${reviewButtonSelector}`, actionRow).click();
	}

	const rghActionRow = actionRow.cloneNode(true);
	const cancelButton = $(`button${cancelButtonSelector}`, rghActionRow);
	cancelButton.addEventListener('click', () => $(`button${cancelButtonSelector}`, actionRow).click());
	buttons.push(cancelButton);
	cancelButton.parentElement!.replaceChildren(...buttons.toReversed());

	radioGroup.classList.add('d-none');
	// It re-renders every time a radio button is selected, so use a clone
	actionRow.classList.add('d-none');
	actionRow.after(rghActionRow);
	// Fix tooltips getting cut off
	dialog.style.overflow = 'visible';

	// Sync the disabled state of our "Comment" button with the original submit button
	// When the "Comment" option is selected, actionRow re-renders each time the submit button state changes
	const commentButton = buttons[0] as HTMLButtonElement;
	const observer = new MutationObserver(() => {
		commentButton.disabled = $(`button${reviewButtonSelector}`, actionRow).disabled;
	});
	observer.observe(actionRow, {childList: true});
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
	delegate('button[class*="ReviewMenuButton-module__ReviewMenuButton"]', 'click', replaceCheckboxesReact, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRFiles,
	],
	init,
});

/*

Test URLs

https://github.com/refined-github/sandbox/pull/4/files
https://github.com/refined-github/sandbox/pull/12/files
https://github.com/facebook/react/pull/14679/files (No radio buttons)
A pull request opened by you ("Approve" and "Request changes" radio buttons will be disabled)
*/
