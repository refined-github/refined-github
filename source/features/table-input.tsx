import './table-input.css';

import React from 'dom-chef';
import TableIcon from 'octicons-plain-react/Table';
import * as pageDetect from 'github-url-detection';
import {insertTextIntoField} from 'text-field-edit';
import delegate, {type DelegateEvent} from 'delegate-it';
import {$} from 'select-dom/strict.js';

import features from '../feature-manager.js';
import smartBlockWrap from '../helpers/smart-block-wrap.js';
import observe from '../helpers/selector-observer.js';
import {actionBarSelectors} from '../github-helpers/selectors.js';

function addTable({delegateTarget: square}: DelegateEvent<MouseEvent, HTMLButtonElement>): void {
	const container = square.closest('fieldset') // Issue
		?? square.form!.querySelector('.CommentBox-container')!; // PR
	const field = $('textarea', container);
	const cursorPosition = field.selectionStart;

	const columns = Number(square.dataset.x);
	const rows = Number(square.dataset.y);
	const row = columns === 1
		// One HTML line per row
		? '<tr><td>\n'

		// <tr> on its own line
		// "1 space" indents without causing unwanted Markdown code blocks that 4 spaces would cause
		: '<tr>\n' + ' <td>\n'.repeat(columns);
	field.focus();
	const table = '<table>\n' + row.repeat(rows) + '</table>';
	insertTextIntoField(field, smartBlockWrap(table, field));

	// Move caret to first cell
	field.selectionEnd = field.value.indexOf('<td>', cursorPosition) + '<td>'.length;
}

function append(container: HTMLElement): void {
	container.classList.add('d-flex');

	container.append(
		<details className="details-reset details-overlay select-menu select-menu-modal-right hx_rsm">
			<summary
				className="Button Button--iconOnly Button--invisible Button--medium"
				role="button"
				aria-label="Add a table"
				aria-haspopup="menu"
			>
				<div
					className="tooltipped tooltipped-sw"
					aria-label="Add a table"
				>
					<TableIcon />
				</div>
			</summary>
			<details-menu
				className="select-menu-modal position-absolute right-0 hx_rsm-modal rgh-table-input"
				role="menu"
			>
				{Array.from({length: 25}).map((_, index) => (
					<button
						type="button"
						role="menuitem"
						className="rgh-tic btn-link"
						data-x={(index % 5) + 1}
						data-y={Math.floor(index / 5) + 1}
					/>
				))}
			</details-menu>
		</details>,
	);
}

function init(signal: AbortSignal): void {
	observe(actionBarSelectors, append, {signal});
	delegate('.rgh-tic', 'click', addTable, {signal});
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
