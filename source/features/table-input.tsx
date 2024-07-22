import './table-input.css';
import delegate, {DelegateEvent} from 'delegate-it';
import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import TableIcon from 'octicons-plain-react/Table';
import {insertTextIntoField} from 'text-field-edit';

import features from '../feature-manager.js';
import {triggerActionBarOverflow} from '../github-helpers/index.js';
import observe from '../helpers/selector-observer.js';
import smartBlockWrap from '../helpers/smart-block-wrap.js';

function addTable({delegateTarget: square}: DelegateEvent<MouseEvent, HTMLButtonElement>): void {
	/* There's only one rich-text editor even when multiple fields are visible; the class targets it #5303 */
	const field = square.form!.querySelector('textarea.js-comment-field')!;
	const cursorPosition = field.selectionStart;

	const columns = Number(square.dataset.x);
	const rows = Number(square.dataset.y);
	const row =
		columns === 1
			? // One HTML line per row
				'<tr><td>\n'
			: // <tr> on its own line
				// "1 space" indents without causing unwanted Markdown code blocks that 4 spaces would cause
				'<tr>\n' + ' <td>\n'.repeat(columns);
	field.focus();
	const table = '<table>\n' + row.repeat(rows) + '</table>';
	insertTextIntoField(field, smartBlockWrap(table, field));

	// Move caret to first cell
	field.selectionEnd = field.value.indexOf('<td>', cursorPosition) + '<td>'.length;
}

function append(container: HTMLElement): void {
	const wrapperClasses = ['details-reset', 'details-overlay', 'flex-auto', 'select-menu', 'select-menu-modal-right', 'hx_rsm', 'ActionBar-item'];

	const buttonClasses = ['Button', 'Button--iconOnly', 'Button--invisible', 'Button--medium'];

	container.append(
		<details
			className={wrapperClasses.join(' ')}
			data-targets="action-bar.items" // Enables automatic hiding when it doesn't fit
		>
			<summary className={buttonClasses.join(' ')} role="button" aria-label="Add a table" aria-haspopup="menu">
				<div className="tooltipped tooltipped-sw" aria-label="Add a table">
					<TableIcon />
				</div>
			</summary>
			<details-menu className="select-menu-modal position-absolute left-0 hx_rsm-modal rgh-table-input" role="menu">
				{Array.from({length: 25}).map((_, index) => (
					<button type="button" role="menuitem" className="rgh-tic btn-link" data-x={(index % 5) + 1} data-y={Math.floor(index / 5) + 1}>
						<div />
					</button>
				))}
			</details-menu>
		</details>,
	);

	triggerActionBarOverflow(container);
}

function init(signal: AbortSignal): void {
	observe('[data-target="action-bar.itemContainer"]', append, {signal});
	delegate('.rgh-tic', 'click', addTable, {signal});
}

void features.add(import.meta.url, {
	include: [pageDetect.hasRichTextEditor],
	init,
});

/*

Test URLs:

- Any issue or PR

*/
