import React from 'dom-chef';
import FoldDownIcon from 'octicons-plain-react/FoldDown';
import * as pageDetect from 'github-url-detection';
import {insertTextIntoField} from 'text-field-edit';
import delegate, {type DelegateEvent} from 'delegate-it';
import {$} from 'select-dom/strict.js';

import features from '../feature-manager.js';
import smartBlockWrap from '../helpers/smart-block-wrap.js';
import observe from '../helpers/selector-observer.js';
import {triggerActionBarOverflow} from '../github-helpers/index.js';
import {actionBarSelectors} from '../github-helpers/selectors.js';

function addContentToDetails({delegateTarget}: DelegateEvent<MouseEvent, HTMLButtonElement>): void {
	const container = delegateTarget.closest([
		'form',
		'[data-testid="comment-composer"]', // Add comment form
		'[class^="MarkdownEditor-module__container"]', // Edit comment form
	])!;

	/* There's only one rich-text editor even when multiple fields are visible; the class targets it #5303 */
	const field = $([
		'textarea.js-comment-field', // TODO: remove after March 2025
		'textarea[aria-labelledby="comment-composer-heading"]', // Add comment textarea
		'[class^="MarkdownInput-module__textArea"] textarea', // Edit comment textarea
	], container);
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

	const divider = $([
		'hr[data-targets="action-bar.items"]', // TODO: remove after March 2025
		'[class^="Toolbar-module__divider"]',
	], container).cloneNode(true);

	container.append(
		divider,
		<button
			type="button"
			className={classes.join(' ')}
			aria-label="Add collapsible content"
			data-targets="action-bar.items" // Enables automatic hiding when it doesn't fit
		>
			<FoldDownIcon />
		</button>,
	);

	if (container.getAttribute('aria-label') === 'Formatting tools') {
		return;
	}

	// Only needed on the old version
	// TODO: remove after March 2025
	triggerActionBarOverflow(container);
}

function init(signal: AbortSignal): void {
	observe(actionBarSelectors, append, {signal});
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
