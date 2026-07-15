import * as pageDetect from 'github-url-detection';
import {elementExists} from 'select-dom';
import {mount} from 'svelte';

import features from '../feature-manager.js';
import {
	getReviewControls,
	type ReviewActionValue,
} from '../helpers/review-submission.js';
import observe from '../helpers/selector-observer.js';
import OneClickReviewSubmission from './one-click-review-submission.svelte';

function replaceNativeControls(fieldset: HTMLFieldSetElement): void {
	const controls = getReviewControls(fieldset);
	if (elementExists('.rgh-one-click-review-submission', controls.dialog)) {
		return;
	}

	const restore = (): void => {
		controls.fieldset.hidden = false;
		controls.nativeSubmitWrapper.hidden = false;
	};

	const submit = (value: ReviewActionValue): void => {
		const radio = controls.radios.get(value);
		if (!radio) {
			throw new Error(`Missing native review action: ${value}`);
		}

		if (radio.disabled) {
			return;
		}

		radio.click();
		requestAnimationFrame(() => {
			controls.nativeSubmitButton.click();
		});
	};

	mount(OneClickReviewSubmission, {
		target: controls.actionsGroup,
		anchor: controls.nativeSubmitWrapper,
		props: {
			actions: controls.actions,
			onSubmit: submit,
			onRestore: restore,
		},
	});

	// Hide native controls only after the replacement mounted successfully.
	controls.fieldset.hidden = true;
	controls.nativeSubmitWrapper.hidden = true;
}

function init(signal: AbortSignal): void {
	observe(
		'[role="dialog"] fieldset[data-component="RadioGroup"]',
		replaceNativeControls,
		{signal},
	);
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

https://github.com/refined-github/refined-github/pull/9804/changes

*/
