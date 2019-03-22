/*
	Automatically expands textareas to fit ALL of their content, rather than have a height limit like GitHub's native "fit to content" behavior
*/

import delegate from 'delegate-it';
import fitTextarea from 'fit-textarea';
import features from '../libs/features';

function listener({ delegateTarget: textarea }) {
	// `fit-textarea` adds only once listener
	fitTextarea.watch(textarea);

	// Disable constrained native feature
	textarea.classList.replace('js-size-to-fit', 'rgh-fit-textareas');
}

function init(): void {
	delegate('textarea', 'focusin', listener);
}

features.add({
	id: 'fit-textareas',
	init
});
