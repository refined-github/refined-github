import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import {FoldDownIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';
import * as textFieldEdit from 'text-field-edit';

import features from '.';
import smartBlockWrap from '../helpers/smart-block-wrap';
import {onCommentEdit} from '../github-events/on-fragment-load';

function addContentToDetails({delegateTarget}: delegate.Event<MouseEvent, HTMLButtonElement>): void {
	/* There's only one rich-text editor even when multiple fields are visible; the class targets it #5303 */
	const field = delegateTarget.form!.querySelector('textarea.js-comment-field')!;
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
		field.value.lastIndexOf('</details>', field.selectionStart) - 2,
	);
}

function addButtons(): void {
	for (const anchor of select.all('md-ref:not(.rgh-collapsible-content-btn-added)')) {
		anchor.classList.add('rgh-collapsible-content-btn-added');
		anchor.after(
			<button type="button" className="toolbar-item btn-octicon p-2 p-md-1 tooltipped tooltipped-sw rgh-collapsible-content-btn" aria-label="Add collapsible content">
				<FoldDownIcon/>
			</button>,
		);
	}
}

function init(): Deinit[] {
	addButtons();

	return [
		delegate(document, '.rgh-collapsible-content-btn', 'click', addContentToDetails),
		onCommentEdit(addButtons),
	];
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasRichTextEditor,
	],
	deduplicate: 'has-rgh-inner',
	init,
});
