/*
	Automatically expands textareas to fit ALL of their content, rather than have a height limit like GitHub's native "fit to content" behavior
*/

import delegate from 'delegate-it';
import features from '../libs/features';
import fitTextarea from 'fit-textarea';
import select from 'select-dom';

function enableTextarea(textarea) {
	console.log('enabling');
	// `fit-textarea` adds only once listener
	fitTextarea.watch(textarea);

	// Disable constrained native feature
	textarea.classList.replace('js-size-to-fit', 'rgh-fit-textareas');
}

function listener({ delegateTarget: textarea }) {
	enableTextarea(textarea);
	console.log('listener')
}

function init(): void {
	// Enable on existing textareas
	select.all('textarea').forEach(enableTextarea);

	// And on any dynamic ones
	delegate('textarea', 'focusin', listener);
}

features.add({
	id: 'fit-textareas',
	load: features.onAjaxedPages,
	init
});
