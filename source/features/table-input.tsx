import './table-input.css';
import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import TableIcon from 'octicon/diff-added.svg';
import * as pageDetect from 'github-url-detection';
import * as textFieldEdit from 'text-field-edit';

import features from '.';
import smartBlockWrap from '../helpers/smart-block-wrap';

type TableDimensions = [width: number, height: number];
function generateHtmlTable([width, height]: TableDimensions): string {
	return '<table>\n' + ('<tr>\n' + '\t<td>\n'.repeat(width)).repeat(height) + '</table>\n';
}

function addTable(event: delegate.Event<MouseEvent, HTMLButtonElement>): void {
	const field = event.delegateTarget.form!.querySelector('textarea')!;
	const cursorPosition = field.selectionStart;

	textFieldEdit.insert(field, smartBlockWrap(generateHtmlTable(['x', 'y'].map(dimension => event.delegateTarget.dataset[dimension]!).map(Number) as TableDimensions), field));

	field.focus();
	const firstRowPosition = field.value.indexOf('<td>', cursorPosition) + '<td>'.length;
	field.setSelectionRange(firstRowPosition, firstRowPosition);
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
					<TableIcon/>
				</summary>
				<details-menu className="select-menu-modal position-absolute left-0 hx_rsm-modal rgh-table-input" role="menu">
					{Array.from({length: 25}).map((_, index) => (
						<button
							type="button"
							role="menuitem"
							className="rgh-table-input-cell"
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
