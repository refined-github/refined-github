import {$, $$, closestElement} from 'select-dom';
import {assertPresent} from 'ts-extras';

import {assertNodeContent} from './dom-utils.js';

const expectedActions = {
	comment: 'Comment',
	approve: 'Approve',
	'request changes': 'Request changes',
} as const;

export type ReviewActionValue = keyof typeof expectedActions;
export type ReviewAction = {
	value: ReviewActionValue;
	label: string;
	description: string;
	disabled: boolean;
};

export type ReviewControls = {
	dialog: HTMLElement;
	fieldset: HTMLFieldSetElement;
	nativeSubmitButton: HTMLButtonElement;
	nativeSubmitWrapper: HTMLElement;
	actionsGroup: HTMLElement;
	radios: Map<ReviewActionValue, HTMLInputElement>;
	actions: ReviewAction[];
};

export function getReviewControls(fieldset: HTMLFieldSetElement): ReviewControls {
	const dialog = closestElement('[role="dialog"]', fieldset);
	assertNodeContent($('h1', dialog), 'Finish your comments');
	assertNodeContent($('[data-component="RadioGroup.Label"]', fieldset), 'Review event');

	const radioElements = $$<HTMLInputElement>('input[type="radio"][name="reviewEvent"]', fieldset);
	if (radioElements.length !== Object.keys(expectedActions).length) {
		throw new Error(`Expected 3 review actions, found ${radioElements.length}`);
	}

	const radios = new Map<ReviewActionValue, HTMLInputElement>();
	const actions = radioElements.map(radio => {
		if (!Object.hasOwn(expectedActions, radio.value)) {
			throw new Error(`Unexpected review action: ${radio.value}`);
		}

		const value = radio.value as ReviewActionValue;
		if (radios.has(value)) {
			throw new Error(`Duplicate review action: ${value}`);
		}

		const label = $(`label[for="${radio.id}"]`, fieldset);
		assertNodeContent($('.text-bold', label), expectedActions[value]);
		const description = label.lastElementChild;
		assertPresent(description);
		radios.set(value, radio);

		return {
			value,
			label: expectedActions[value],
			description: description.textContent.trim(),
			disabled: radio.disabled,
		};
	});

	const nativeSubmitButtons = $$<HTMLButtonElement>('button[data-variant="primary"]', dialog)
		.filter(button => button.textContent.trim().startsWith('Submit '));
	if (nativeSubmitButtons.length !== 1) {
		throw new Error(`Expected one review submit button, found ${nativeSubmitButtons.length}`);
	}

	const nativeSubmitButton = nativeSubmitButtons[0];
	const nativeSubmitWrapper = nativeSubmitButton.parentElement;
	assertPresent(nativeSubmitWrapper);
	const actionsGroup = nativeSubmitWrapper.parentElement;
	assertPresent(actionsGroup);

	const cancelButtons = $$<HTMLButtonElement>('button', actionsGroup)
		.filter(button => button.textContent.trim() === 'Cancel');
	if (cancelButtons.length !== 1) {
		throw new Error(`Expected one review cancel button, found ${cancelButtons.length}`);
	}

	return {
		dialog,
		fieldset,
		nativeSubmitButton,
		nativeSubmitWrapper,
		actionsGroup,
		radios,
		actions,
	};
}
