import './table-input.css';
import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import {TableIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';
import * as textFieldEdit from 'text-field-edit';

import features from '.';
import smartBlockWrap from '../helpers/smart-block-wrap';
import {onCommentEdit} from '../github-events/on-fragment-load';

function addTable({delegateTarget: square}: delegate.Event<MouseEvent, HTMLButtonElement>): void {
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

function highlightSquares({delegateTarget: hover}: delegate.Event<MouseEvent, HTMLElement>): void {
	for (const cell of hover.parentElement!.children as HTMLCollectionOf<HTMLButtonElement>) {
		cell.classList.toggle('selected', cell.dataset.x! <= hover.dataset.x! && cell.dataset.y! <= hover.dataset.y!);
	}
}

function addButtons(): void {
	for (const anchor of select.all('md-task-list:not(.rgh-table-input-added)')) {
		anchor.classList.add('rgh-table-input-added');
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
							className="rgh-table-input-cell btn-link"
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
}

function init(): Deinit[] {
	addButtons();

	return [
		onCommentEdit(addButtons),
		delegate(document, '.rgh-table-input-cell', 'click', addTable),
		delegate(document, '.rgh-table-input-cell', 'mouseenter', highlightSquares, {capture: true}),
	];
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasRichTextEditor,
	],
	deduplicate: 'has-rgh-inner',
	init,
});
