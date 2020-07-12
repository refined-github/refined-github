import './vertical-front-matter.css';
import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): void | false {
	const table = select('[data-table-type="yaml-metadata"]');
	if (!table) {
		return;
	}

	const theadCells = select.all(':scope > thead th', table);
	if (theadCells.length <= 4) {
		return false;
	}

	const tbodyCells = select.all(':scope > tbody > tr > td', table);
	table.replaceWith(
		<table className="rgh-vertical-front-matter-table" data-table-type="yaml-metadata">
			<tbody>
				{theadCells.map((cell, index) => (
					<tr>
						{cell}
						{tbodyCells[index]}
					</tr>
				))}
			</tbody>
		</table>
	);
}

void features.add({
	id: __filebasename,
	description: 'Show Markdown front matter as vertical table.',
	screenshot: 'https://user-images.githubusercontent.com/44045911/87251695-26069b00-c4a0-11ea-9077-53ce366490ed.png'
}, {
	include: [
		pageDetect.isSingleFile
	],
	init
});
