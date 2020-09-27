import './table-input.css';
import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import TableIcon from 'octicon/diff-added.svg';
import * as pageDetect from 'github-url-detection';
import * as textFieldEdit from 'text-field-edit';

import features from '.';

function generateHTMLTable(w: number, h: number): string {
	return  '<table>\n' + ('<tr>\n' + '\t<td>\n'.repeat(w)).repeat(h);
}

function addTable(event: delegate.Event<MouseEvent, HTMLButtonElement>): void {
	const field = event.delegateTarget.form!.querySelector('textarea')!;
	const endsWithNl = field.value.length && !field.value.endsWith('\n');
	const cursorPos = field.value.length + (endsWithNl ? 4 : 3);

	textFieldEdit.insert(field, (endsWithNl ? '\n' : '') + generateHTMLTable(parseInt(event.delegateTarget.dataset.x!, 10), parseInt(event.delegateTarget.dataset.y!, 10)));

	field.focus();
	field.setSelectionRange(cursorPos, cursorPos);
}

function highlightSquares({delegateTarget: hover}: delegate.Event<MouseEvent, HTMLElement>): void {
	for (const cell of Array.from(hover.parentElement!.children) as HTMLElement[]) {
		cell.classList.toggle('selected', cell.dataset.x! <= hover.dataset.x! && cell.dataset.y! <= hover.dataset.y!)
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
				<details-menu className="select-menu-modal position-absolute left-0 hx_rsm-modal rgh-add-table-popup" role="menu">
					{Array.from({length: 25}).map((_, i) => (
						<button
							type="button"
							role="menuitem"
							className="rgh-table-input-cell"
							data-x={i % 5 + 1}
							data-y={Math.floor(i / 5) + 1}
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
	description: 'Adds a popup in the toolbar of the enriched text editor to insert a GFM table.',
	screenshot: 'TODO'
}, {
	include: [
		pageDetect.hasRichTextEditor
	],
	init
});
