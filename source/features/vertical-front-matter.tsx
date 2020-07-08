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

	// Table > thead
	const thead = table.firstElementChild!;
	// Table > thead > tr
	const theadTr = thead.firstElementChild!;
	const count = theadTr.childElementCount;
	if (count <= 4) {
		return;
	}

	table.classList.add('rgh-vertical-front-matter-table');
	// Table > tbody
	const tbody = table.lastElementChild!;
	// Table > tbody > tr
	const tbodyTr = tbody.firstElementChild!;
	for (let i = 0; i < count; i++) {
		// Table > thead > tr > th
		tbody.append(
			<tr>
				{theadTr.firstElementChild!}
				{tbodyTr.firstElementChild!}
			</tr>
		);
	}

	// Cleanup
	thead.remove();
	tbodyTr.remove();
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
