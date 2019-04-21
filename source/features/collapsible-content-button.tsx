/*
Insert collapsible content when writing comments (via `<summary>`)

https://user-images.githubusercontent.com/1402241/53678019-0c721280-3cf4-11e9-9c24-4d11a697f67c.png
*/

import React from 'dom-chef';
import select from 'select-dom';
import delegate, {DelegateEvent} from 'delegate-it';
import insertText from 'insert-text-textarea';
import features from '../libs/features';
import * as icons from '../libs/icons';

// Wraps string in at least 2 \n on each side,
// as long as the field doesn't already have them.
// Code adopted/adapted from GitHub.
function smartBlockWrap(content: string, field: HTMLTextAreaElement): string {
	const before = field.value.slice(0, field.selectionStart);
	const after = field.value.slice(field.selectionEnd);
	const [whitespaceAtStart] = before.match(/\n*$/) || [''];
	const [whitespaceAtEnd] = after.match(/^\n*/) || [''];
	let newlinesToAppend = '';
	let newlinesToPrepend = '';
	if (before.match(/\S/) && whitespaceAtStart.length < 2) {
		newlinesToPrepend = '\n'.repeat(2 - whitespaceAtStart.length);
	}

	if (after.match(/\S/) && whitespaceAtEnd.length < 2) {
		newlinesToAppend = '\n'.repeat(2 - whitespaceAtEnd.length);
	}

	return newlinesToPrepend + content + newlinesToAppend;
}

function init(): void {
	delegate('.rgh-collapsible-content-btn', 'click', addContentToDetails);
	for (const anchor of select.all('md-ref')) {
		anchor.after(
			<button type="button" className="toolbar-item tooltipped tooltipped-n rgh-collapsible-content-btn" aria-label="Add collapsible content">
				{icons.foldDown()}
			</button>
		);
	}
}

function addContentToDetails(event: DelegateEvent<MouseEvent, HTMLButtonElement>): void {
	const field = event.delegateTarget.form!.querySelector('textarea')!;

	// Don't indent <summary> because indentation will not be automatic on multi-line content
	const newContent = `
		<details>
		<summary>Details</summary>

		${getSelection()!.toString()}

		</details>
	`.replace(/(\n|\b)\t+/g, '$1').trim();

	// Inject new tags; it'll be undoable
	insertText(field, smartBlockWrap(newContent, field));

	// Restore selection.
	// `selectionStart` will be right after the newly-inserted text
	field.setSelectionRange(
		field.value.lastIndexOf('</summary>', field.selectionStart) + '</summary>'.length + 2,
		field.value.lastIndexOf('</details>', field.selectionStart) - 2
	);
}

features.add({
	id: 'collapsible-content-button',
	include: [
		features.hasRichTextEditor
	],
	load: features.onAjaxedPages,
	init
});
