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
	for (const cell of Array.from(hover.parentElement!.children) as HTMLElement[]) {
		cell.classList.toggle('selected', cell.dataset.x! <= hover.dataset.x! && cell.dataset.y! <= hover.dataset.y!);
	}
}

function init(): void {
	delegate(document, '.rgh-table-input-cell', 'click', addTable);
	delegate(document, '.rgh-table-input-cell', 'mouseover', highlightSquares);

	for (const anchor of select.all('md-task-list')) {
		anchor.after(
			<details className="details-reset details-overlay flex-auto toolbar-item select-menu select-menu-modal-right hx_rsm">
				<summary
					className="text-center menu-target py-2 p-md-1 hx_rsm-trigger ml-1"
					role="button"
					aria-label="Add a table"
					aria-haspopup="menu"
				>
					{/* eslint-disable react/no-unknown-property */}
					<svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" className="octicon octicon-diff-added">
						<path d="m13.25,2.5l-10.5,0c-0.13807,0 -0.25,0.11193 -0.25,0.25l0,10.5c0,0.1381 0.11193,0.25 0.25,0.25l10.5,0c0.1381,0 0.25,-0.1119 0.25,-0.25l0,-10.5c0,-0.13807 -0.1119,-0.25 -0.25,-0.25zm-10.5,-1.5l10.5,0c0.9665,0 1.75,0.7835 1.75,1.75l0,10.5c0,0.9665 -0.7835,1.75 -1.75,1.75l-10.5,0c-0.9665,0 -1.75,-0.7835 -1.75,-1.75l0,-10.5c0,-0.9665 0.7835,-1.75 1.75,-1.75zm5.25,3c0.41421,0 0.75,0.33579 0.75,0.75l0,2.5l2.5,0c0.4142,0 0.75,0.33579 0.75,0.75c0,0.41421 -0.3358,0.75 -0.75,0.75l-2.5,0l0,2.5c0,0.4142 -0.33579,0.75 -0.75,0.75c-0.41421,0 -0.75,-0.3358 -0.75,-0.75l0,-2.5l-2.5,0c-0.41421,0 -0.75,-0.33579 -0.75,-0.75c0,-0.41421 0.33579,-0.75 0.75,-0.75l2.5,0l0,-2.5c0,-0.41421 0.33579,-0.75 0.75,-0.75z" clip-rule="evenodd" fill-rule="evenodd"/>
						<line y2="14.168" x2="8.00791" y1="1.80263" x1="7.99209" stroke-width="1.6" stroke="currentColor"/>
						<line y2="8.00113" x2="14.16224" y1="8.00113" x1="1.76197" stroke-width="1.6" stroke="currentColor"/>
					</svg>
					{/* eslint-enable react/no-unknown-property */}
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

void features.add({
	id: __filebasename,
	description: 'Adds a button in the text editor to quickly insert a simplified HTML table.',
	screenshot: 'TODO'
}, {
	include: [
		pageDetect.hasRichTextEditor
	],
	init
});
