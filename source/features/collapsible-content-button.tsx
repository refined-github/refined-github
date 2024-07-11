import React from 'dom-chef';
import FoldDownIcon from 'octicons-plain-react/FoldDown';
import * as pageDetect from 'github-url-detection';
import {insertTextIntoField} from 'text-field-edit';
import delegate, {DelegateEvent} from 'delegate-it';

import features from '../feature-manager.js';
import smartBlockWrap from '../helpers/smart-block-wrap.js';
import observe from '../helpers/selector-observer.js';
import {triggerActionBarOverflow} from '../github-helpers/index.js';

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
	insertTextIntoField(field, smartBlockWrap(newContent, field));

	// Restore selection.
	// `selectionStart` will be right after the newly-inserted text
	field.setSelectionRange(
		field.value.lastIndexOf('</summary>', field.selectionStart) + '</summary>'.length + 2,
		field.value.lastIndexOf('</details>', field.selectionStart) - 2,
	);
}

function append(container: HTMLElement): void {
	const classes = [
		'Button',
		'Button--iconOnly',
		'Button--invisible',
		'Button--medium',
		'tooltipped',
		'tooltipped-sw',
		'rgh-collapsible-content-btn',
	];

	container.append(
		<button
			type="button"
			className={classes.join(' ')}
			aria-label="Add collapsible content"
			data-targets="action-bar.items" // Enables automatic hiding when it doesn't fit
		>
			<FoldDownIcon/>
		</button>,
	);

	triggerActionBarOverflow(container);
}

function init(signal: AbortSignal): void {
	observe(
		'[data-target="action-bar.itemContainer"]', append, {signal});
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
