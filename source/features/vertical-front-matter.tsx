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

	const thead = table.firstElementChild!;
	// Table > thead > tr > th
	const theadCells = [...thead.firstElementChild!.children];
	if (theadCells.length <= 4) {
		return;
	}

	const tbody = table.lastElementChild!;
	// Table > tbody > tr > td
	const tbodyCells = [...tbody.firstElementChild!.children];
	for (let i = 0; i < theadCells.length; i++) {
		tbody.prepend(
			<tr>
				{theadCells[i]}
				{tbodyCells[i]}
			</tr>
		);
	}

	// Cleanup
	table.classList.add('rgh-vertical-front-matter-table');
	thead.remove();
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
