import './fit-textareas.css';

import {isSafari} from 'webext-detect';
import fitTextarea from 'fit-textarea';
import {$} from 'select-dom/strict.js';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

const nativeFit = CSS.supports('field-sizing', 'content');

function resetListener({target}: Event): void {
	const field = $('textarea', target as HTMLFormElement);
	// Delay because the field is still filled while the `reset` event is firing
	setTimeout(fitTextarea, 0, field);
}

function inputListener({target}: Event): void {
	fitTextarea(target as HTMLTextAreaElement);
}

function watchTextarea(textarea: HTMLTextAreaElement, {signal}: SignalAsOptions): void {
	// Disable constrained GitHub feature
	textarea.classList.remove('size-to-fit', 'js-size-to-fit', 'issue-form-textarea'); // Remove !important height and min-height
	textarea.classList.add('rgh-fit-textareas');

	if (nativeFit) {
		return;
	}

	textarea.addEventListener('input', inputListener, {signal}); // The user triggers `input` event
	textarea.addEventListener('focus', inputListener, {signal}); // The user triggers `focus` event
	textarea.addEventListener('change', inputListener, {signal}); // File uploads trigger `change` events
	textarea.form?.addEventListener('reset', resetListener, {signal});
	fitTextarea(textarea);
}

function init(signal: AbortSignal): void {
	// `anchored-position`: Exclude PR review box because it's in a `position:fixed` container; The scroll HAS to appear within the fixed element.
	// `#pull_request_body_ghost`: Special textarea that GitHub just matches to the visible textarea
	observe(`
		textarea:not(
			anchored-position #pull_request_review_body,
			#pull_request_body_ghost,
			#pull_request_body_ghost_ruler
		)
	`, watchTextarea, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasRichTextEditor,
	],
	exclude: [
		// Allow Safari only if it supports the native version
		() => isSafari() && !nativeFit,
	],
	init,
});

/*

Test URLs:

https://github.com/refined-github/sandbox/issues/3

*/
