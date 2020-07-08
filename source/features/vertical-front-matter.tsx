import './vertical-front-matter.css';
import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): void {
	const table = select('[data-table-type="yaml-metadata"]');
	if (!table) {
		return;
	}

	const theadCells = select.all('[data-table-type="yaml-metadata"] > thead th', table);
	if (theadCells.length <= 4) {
		return;
	}

	const tbodyCells = select.all('[data-table-type="yaml-metadata"] > tbody > tr > td', table);
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
	screenshot: 'https://user-images.githubusercontent.com/44045911/86938650-3bfc1f00-c173-11ea-963d-2a877b931461.png'
}, {
	include: [
		pageDetect.isSingleFile
	],
	init
});
