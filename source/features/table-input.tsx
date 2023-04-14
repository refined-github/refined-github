import './table-input.css';
import React from 'dom-chef';
import {TableIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';
import * as textFieldEdit from 'text-field-edit';
import delegate, {DelegateEvent} from 'delegate-it';

import features from '../feature-manager';
import smartBlockWrap from '../helpers/smart-block-wrap';
import observe from '../helpers/selector-observer';
import {isHasSelectorSupported} from '../helpers/select-has';

function addTable({delegateTarget: square}: DelegateEvent<MouseEvent, HTMLButtonElement>): void {
	/* There's only one rich-text editor even when multiple fields are visible; the class targets it #5303 */
	const field = square.form!.querySelector('textarea.js-comment-field')!;
	const cursorPosition = field.selectionStart;

	field.focus();
	const table
		= '<table>\n'
			+ ('<tr>\n'
				+ '\t<td>\n'.repeat(Number(square.dataset.x))
			).repeat(Number(square.dataset.y))
		+ '</table>';
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
	delegate(document, '.rgh-tic', 'click', addTable, {signal});
	if (!isHasSelectorSupported) {
		delegate(document, '.rgh-tic', 'mouseenter', highlightSquares, {capture: true, signal});
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasRichTextEditor,
	],
	init,
});
