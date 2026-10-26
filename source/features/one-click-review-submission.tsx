// https://github.com/refined-github/refined-github/issues/8711
import './one-click-review-submission.css';

import * as pageDetect from 'github-url-detection';
import {$, $$, $optional, closestElement} from 'select-dom';
import {mount, unmount} from 'svelte';
import {assertPresent} from 'ts-extras';

import features from '../feature-manager.js';
import delay from '../helpers/delay.js';
import {assertNodeContent} from '../helpers/dom-utils.js';
import observe from '../helpers/selector-observer.js';
import singleton from '../helpers/singleton.js';
import OneClickReview from './one-click-review-submission.svelte';

const hiddenAttribute = 'data-rgh-one-click-review';
const submitSelector = 'button[class*="SubmitReviewButton"]';

let lastSubmission = 0;
async function submit(dialog: HTMLElement, value: string): Promise<void> {
	if (Date.now() - lastSubmission < 1000) {
		console.log('Duplicate submission prevented');
		return;
	}

	lastSubmission = Date.now();

	// Query again on every submission because React might have replaced the elements
	$(`input[name="reviewEvent"][value="${value}"]`, dialog).click();
	// Let React commit the selection before the native button reads it
	await delay(0);
	$(submitSelector, dialog).click();
}

function enhance(dialog: HTMLElement): () => void {
	// Everything is asserted before touching the native UI, so that a failure leaves it intact
	const choices = $$('input[type="radio"][name="reviewEvent"]', dialog).map(radio => {
		const control = closestElement('[data-component="FormControl"]', radio);
		const title = $('.text-bold', control);
		assertNodeContent(title, /^(?:Comment|Approve|Request changes)$/);

		return {
			value: radio.value,
			label: title.textContent,
			// Optional because it's only used for the tooltip
			description: $optional('[class*="RadioText"]', control)?.textContent.trim() ?? '',
			disabled: radio.disabled,
		};
	});
	assertPresent(choices[0]);

	const cancel = $$('button', dialog).find(button => button.textContent.trim() === 'Cancel');
	assertPresent(cancel);

	const nativeSubmit = closestElement('[data-loading-wrapper]', $(submitSelector, dialog));
	const classes = {
		button: cancel.className,
		content: $('[data-component="buttonContent"]', cancel).className,
		label: $('[data-component="text"]', cancel).className,
	};

	const restoration = new AbortController();
	dialog.setAttribute(hiddenAttribute, '');
	const app = mount(OneClickReview, {
		target: nativeSubmit.parentElement!,
		anchor: nativeSubmit,
		props: {
			choices,
			classes,
			onSubmit(value: string) {
				void submit(dialog, value);
			},
			onRestore() {
				restoration.abort();
			},
		},
	});
	restoration.signal.addEventListener('abort', () => {
		dialog.removeAttribute(hiddenAttribute);
		void unmount(app);
	});

	return () => {
		restoration.abort();
	};
}

function init(signal: AbortSignal): void {
	// Wait until the radios and the submit button are both rendered
	observe(
		'div[role="dialog"][aria-labelledby="anchored-review-title"]:has(input[name="reviewEvent"]):has(button[class*="SubmitReviewButton"])',
		singleton(enhance),
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

https://github.com/refined-github/sandbox/pull/4/files
https://github.com/refined-github/sandbox/pull/12/files

*/
