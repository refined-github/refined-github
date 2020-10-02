import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import FoldDownIcon from 'octicon/fold-down.svg';
import * as pageDetect from 'github-url-detection';
import * as textFieldEdit from 'text-field-edit';

import features from '.';
import smartBlockWrap from '../helpers/smart-block-wrap';

function addContentToDetails(event: delegate.Event<MouseEvent, HTMLButtonElement>): void {
	const field = event.delegateTarget.form!.querySelector('textarea')!;
	const selection = field.value.slice(field.selectionStart, field.selectionEnd);

	// Don't indent <summary> because indentation will not be automatic on multi-line content
	const newContent = `
		<details>
		<summary>Details</summary>

		${selection}

		</details>
	`.replace(/(\n|\b)\t+/g, '$1').trim();

	field.focus();
	textFieldEdit.insert(field, smartBlockWrap(newContent, field));

	// Restore selection.
	// `selectionStart` will be right after the newly-inserted text
	field.setSelectionRange(
		field.value.lastIndexOf('</summary>', field.selectionStart) + '</summary>'.length + 2,
		field.value.lastIndexOf('</details>', field.selectionStart) - 2
	);
}

function init(): void {
	delegate(document, '.rgh-collapsible-content-btn', 'click', addContentToDetails);
	for (const anchor of select.all('md-ref')) {
		anchor.after(
			<button type="button" className="toolbar-item tooltipped tooltipped-n rgh-collapsible-content-btn" aria-label="Add collapsible content">
				<FoldDownIcon/>
			</button>
		);
	}
}

void features.add({
	id: __filebasename,
	description: 'Adds a button to insert collapsible content (via `<details>`).',
	screenshot: 'https://user-images.githubusercontent.com/1402241/53678019-0c721280-3cf4-11e9-9c24-4d11a697f67c.png'
}, {
	include: [
		pageDetect.hasRichTextEditor
	],
	init
});
