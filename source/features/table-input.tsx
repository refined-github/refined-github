import './table-input.css';
import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';
import * as textFieldEdit from 'text-field-edit';

import features from '.';
import smartBlockWrap from '../helpers/smart-block-wrap';

function addTable({delegateTarget: square}: delegate.Event<MouseEvent, HTMLButtonElement>): void {
	const field = square.form!.querySelector('textarea')!;
	const cursorPosition = field.selectionStart;

	field.focus();
	const table =
		'<table>\n' +
			('<tr>\n' +
				'\t<td>\n'.repeat(Number(square.dataset.x))
			).repeat(Number(square.dataset.y)) +
		'</table>';
	textFieldEdit.insert(field, smartBlockWrap(table, field));

	// Move caret to first cell
	field.selectionEnd = field.value.indexOf('<td>', cursorPosition) + '<td>'.length;
}

function highlightSquares({delegateTarget: hover}: delegate.Event<MouseEvent, HTMLElement>): void {
	for (const cell of hover.parentElement!.children as HTMLCollectionOf<HTMLButtonElement>) {
		cell.classList.toggle('selected', cell.dataset.x! <= hover.dataset.x! && cell.dataset.y! <= hover.dataset.y!);
	}
}

function init(): void {
	delegate(document, '.rgh-table-input-cell', 'click', addTable);
	delegate(document, '.rgh-table-input-cell', 'mouseenter', highlightSquares, {capture: true});

	for (const anchor of select.all('md-task-list')) {
		anchor.after(
			<details className="details-reset details-overlay flex-auto toolbar-item select-menu select-menu-modal-right hx_rsm">
				<summary
					className="text-center menu-target py-2 p-md-1 hx_rsm-trigger tooltipped tooltipped-n mx-1"
					role="button"
					aria-label="Add a table"
					aria-haspopup="menu"
				>
					<svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" className="octicon">
						<path d="m2.75 1c-0.9665 0-1.75 0.7835-1.75 1.75v10.5c0 0.9665 0.7835 1.75 1.75 1.75h10.5c0.9665 0 1.75-0.7835 1.75-1.75v-10.5c0-0.9665-0.7835-1.75-1.75-1.75h-10.5zm0 1.5h4.5v4.75h-4.75v-4.5c0-0.13807 0.11193-0.25 0.25-0.25zm6 0h4.5c0.1381 0 0.25 0.11193 0.25 0.25v4.5h-4.75v-4.75zm-6.25 6.25h4.75v4.75h-4.5c-0.13807 0-0.25-0.1119-0.25-0.25v-4.5zm6.25 0h4.75v4.5c0 0.1381-0.1119 0.25-0.25 0.25h-4.5v-4.75z"/>
					</svg>
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
			</details>
		);
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.hasRichTextEditor
	],
	init
});
