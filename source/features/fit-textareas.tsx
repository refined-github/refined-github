import './fit-textareas.css';
import {isSafari} from 'webext-detect-page';
import fitTextarea from 'fit-textarea';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

function resetListener({target}: Event): void {
	const field = (target as HTMLFormElement).querySelector('textarea')!;
	// Delay because the field is still filled while the `reset` event is firing
	setTimeout(fitTextarea, 0, field);
}

function inputListener({target}: Event): void {
	fitTextarea(target as HTMLTextAreaElement);
}

function watchTextarea(textarea: HTMLTextAreaElement, {signal}: SignalAsOptions): void {
	textarea.addEventListener('input', inputListener, {signal}); // The user triggers `input` event
	textarea.addEventListener('change', inputListener, {signal}); // File uploads trigger `change` events
	textarea.form?.addEventListener('reset', resetListener, {signal});
	fitTextarea(textarea);

	// Disable constrained native feature
	textarea.classList.replace('js-size-to-fit', 'rgh-fit-textareas');
}

function init(signal: AbortSignal): void {
	// Exclude PR review box because it's in a `position:fixed` container;
	// The scroll HAS to appear within the fixed element.
	observe('textarea:not(#pull_request_review_body)', watchTextarea, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasRichTextEditor,
	],
	exclude: [
		isSafari,
	],
	init,
});

/*

Test URLs:

https://github.com/refined-github/sandbox/issues/3

*/
