import './table-input.css';
import React from 'dom-chef';
import {TableIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';
import {insertTextIntoField} from 'text-field-edit';
import delegate, {DelegateEvent} from 'delegate-it';

import {elementExists} from 'select-dom';

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
	insertTextIntoField(field, smartBlockWrap(table, field));

	// Move caret to first cell
	field.selectionEnd = field.value.indexOf('<td>', cursorPosition) + '<td>'.length;
}

function add(anchor: HTMLElement): void {
	const wrapperClasses = [
		'details-reset',
		'details-overlay',
		'flex-auto',
		'select-menu',
		'select-menu-modal-right',
		'hx_rsm',
	];
	if (elementExists('md-ref', anchor)) {
		wrapperClasses.push(
			'toolbar-item',
			'btn-octicon',
			'mx-1',
		);
	}

	const buttonClasses
	= elementExists('md-ref', anchor)
		? [
			'text-center',
			'menu-target',
			'p-2',
			'p-md-1',
			'hx_rsm-trigger',
		]
		: [
			'Button',
			'Button--iconOnly',
			'Button--invisible',
			'Button--medium',
		];

	anchor.after(
		<details className={wrapperClasses.join(' ')}>
			<summary
				className={buttonClasses.join(' ')}
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
	observe([
		'md-ref', // TODO: Drop in June 2024, cleanup button JSX above too
		'.ActionBar-item:has([data-md-button=\'ref\'])',
	], add, {signal});
	delegate('.rgh-tic', 'click', addTable, {signal});
}

void features.add(import.meta.url, {
	asLongAs: [
		isHasSelectorSupported,
	],
	include: [
		pageDetect.hasRichTextEditor,
	],
	init,
});

/*

Test URLs:

- Any issue or PR

*/
