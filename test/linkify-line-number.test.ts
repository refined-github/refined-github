import {parseHTML} from 'linkedom';
import {$} from 'select-dom';
import {assert, test} from 'vitest';

import linkifyLineNumber from '../source/helpers/linkify-line-number.js';

function createLineNumberCell(fileLink: string): HTMLTableCellElement {
	const {document} = parseHTML(`
		<div class="Box">
			<a href="${fileLink}">View file</a>
			<table>
				<tr>
					<td class="blob-num" data-line-number="287">287</td>
				</tr>
			</table>
		</div>
	`);

	return $('.blob-num', document);
}

test('linkify keeps the line number inside its table cell', () => {
	const lineNumberCell = createLineNumberCell('https://github.com/refined-github/refined-github/pull/9510/files#diff-test');

	linkifyLineNumber(lineNumberCell);

	assert.equal(lineNumberCell.tagName, 'TD');
	assert.equal(lineNumberCell.textContent, '287');

	const link = $('a', lineNumberCell);
	assert.instanceOf(link, HTMLAnchorElement);
	assert.equal(link?.textContent, '287');
	assert.equal(link?.getAttribute('href'), '/refined-github/refined-github/pull/9510/files#diff-testR287');
});

test('linkify supports blob permalinks', () => {
	const lineNumberCell = createLineNumberCell('https://github.com/refined-github/refined-github/blob/main/source/file.ts#L42');

	linkifyLineNumber(lineNumberCell);

	const link = $('a', lineNumberCell);
	assert.equal(link?.getAttribute('href'), '/refined-github/refined-github/blob/main/source/file.ts#L287');
});
