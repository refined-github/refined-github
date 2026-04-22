import './fit-textareas.css';

import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import {not} from '../helpers/css-selectors.js';
import observe from '../helpers/selector-observer.js';

const nativeFit = CSS.supports('field-sizing', 'content');

function watchTextarea(textarea: HTMLTextAreaElement): void {
	// Disable constrained GitHub feature
	textarea.classList.remove('size-to-fit', 'js-size-to-fit', 'issue-form-textarea'); // Remove !important height and min-height
	textarea.classList.add('rgh-fit-textareas');
}

function init(signal: AbortSignal): void {
	observe(
		'textarea' + not(
			// `anchored-position`: Exclude PR review box because it's in a `position:fixed` container; The scroll HAS to appear within the fixed element.
			'anchored-position #pull_request_review_body',

			// `#pull_request_body_ghost`: Special textarea that GitHub just matches to the visible textarea
			'#pull_request_body_ghost',
			'#pull_request_body_ghost_ruler',
		),
		watchTextarea,
		{signal},
	);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasRichTextEditor,
	],
	exclude: [
		() => !nativeFit,
	],
	init,
});

/*

Test URLs:

https://github.com/refined-github/sandbox/issues/3

*/
