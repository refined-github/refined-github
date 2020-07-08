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

	const thead = select('thead', table)!;
	const tbody = select('tbody', table)!;
	while (select.exists('th', thead)) {
		const th = select('th', thead)!;
		th.classList.add('rgh-front-matter-name');
		tbody.append(
			<tr>
				{th}
				{select('td', tbody)!}
			</tr>
		);
	}
}

void features.add({
	id: __filebasename,
	description: 'Show Markdown front matter as vertical table.',
	screenshot: 'https://user-images.githubusercontent.com/44045911/86934729-a068af80-c16e-11ea-9d73-7b2efee652d1.png'
}, {
	include: [
		pageDetect.isSingleFile
	],
	init
});
