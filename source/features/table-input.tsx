import './table-input.css';
import React from 'dom-chef';
import {TableIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';
import * as textFieldEdit from 'text-field-edit';
import delegate, {DelegateEvent} from 'delegate-it';

import features from '../feature-manager.js';
import smartBlockWrap from '../helpers/smart-block-wrap.js';
import observe from '../helpers/selector-observer.js';
import {isHasSelectorSupported} from '../helpers/select-has.js';

function addTable({delegateTarget: square}: DelegateEvent<MouseEvent, HTMLButtonElement>): void {
	/* There's only one rich-text editor even when multiple fields are visible; the class targets it #5303 */
	const field = square.form!.querySelector('textarea.js-comment-field')!;
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
	textFieldEdit.insert(field, smartBlockWrap(table, field));

	// Move caret to first cell
	field.selectionEnd = field.value.indexOf('<td>', cursorPosition) + '<td>'.length;
}

function highlightSquares({delegateTarget: hover}: DelegateEvent<MouseEvent, HTMLElement>): void {
	for (const cell of hover.parentElement!.children as HTMLCollectionOf<HTMLButtonElement>) {
		cell.classList.toggle('selected', cell.dataset.x! <= hover.dataset.x! && cell.dataset.y! <= hover.dataset.y!);
	}
}

function add(anchor: HTMLElement): void {
	anchor.after(
		<details className="details-reset details-overlay flex-auto toolbar-item btn-octicon mx-1 select-menu select-menu-modal-right hx_rsm">
			<summary
				className="text-center menu-target p-2 p-md-1 hx_rsm-trigger"
				role="button"
				aria-label="Add a table"
				aria-haspopup="menu"
			>
				<div
					className="tooltipped tooltipped-sw"
					aria-label="Add a table"
				>
					<TableIcon/>
				</div>
			</summary>
			<details-menu className="select-menu-modal position-absolute left-0 hx_rsm-modal rgh-table-input" role="menu">
				{Array.from({length: 25}).map((_, index) => (
					<button
						type="button"
						role="menuitem"
						className="rgh-tic btn-link"
						data-x={(index % 5) + 1}
						data-y={Math.floor(index / 5) + 1}
					>
						<div/>
					</button>
				))}
			</details-menu>
		</details>,
	);
}

function init(signal: AbortSignal): void {
	observe('md-ref', add, {signal});
	delegate('.rgh-tic', 'click', addTable, {signal});
	if (!isHasSelectorSupported()) {
		delegate('.rgh-tic', 'mouseenter', highlightSquares, {capture: true, signal});
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasRichTextEditor,
	],
	init,
});
