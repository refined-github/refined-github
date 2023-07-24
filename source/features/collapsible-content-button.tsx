import React from 'dom-chef';
import {FoldDownIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';
import * as textFieldEdit from 'text-field-edit';
import delegate, {DelegateEvent} from 'delegate-it';

import features from '../feature-manager.js';
import smartBlockWrap from '../helpers/smart-block-wrap.js';
import observe from '../helpers/selector-observer.js';

function addContentToDetails({delegateTarget}: DelegateEvent<MouseEvent, HTMLButtonElement>): void {
	/* There's only one rich-text editor even when multiple fields are visible; the class targets it #5303 */
	const field = delegateTarget.form!.querySelector('textarea.js-comment-field')!;
	const selection = field.value.slice(field.selectionStart, field.selectionEnd);

	// Don't indent <summary> because indentation will not be automatic on multi-line content
	const newContent = `
		<details>
		<summary>Details</summary>

		${selection}

		</details>
	`.replaceAll(/(\n|\b)\t+/g, '$1').trim();

	field.focus();
	textFieldEdit.insert(field, smartBlockWrap(newContent, field));

	// Restore selection.
	// `selectionStart` will be right after the newly-inserted text
	field.setSelectionRange(
		field.value.lastIndexOf('</summary>', field.selectionStart) + '</summary>'.length + 2,
		field.value.lastIndexOf('</details>', field.selectionStart) - 2,
	);
}

function addButtons(referenceButton: HTMLElement): void {
	referenceButton.after(
		<button type="button" className="toolbar-item btn-octicon p-2 p-md-1 tooltipped tooltipped-sw rgh-collapsible-content-btn" aria-label="Add collapsible content">
			<FoldDownIcon/>
		</button>,
	);
}

function init(signal: AbortSignal): void {
	observe('md-ref', addButtons, {signal});
	delegate('.rgh-collapsible-content-btn', 'click', addContentToDetails, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasRichTextEditor,
	],
	init,
});

/*

Test URLs:

- Any issue or PR

*/
