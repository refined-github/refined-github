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
		const tr = document.createElement('tr');
		tr.append(select('th', thead)!);
		tr.append(select('td', tbody)!);
		tbody.append(tr);
	}
}

void features.add({
	id: __filebasename,
	description: 'Show Markdown front matter as vertical table.',
	screenshot: 'https://user-images.githubusercontent.com/184316/86918308-c9655200-c126-11ea-8e10-31013667dd76.png'
}, {
	include: [
		pageDetect.isSingleFile
	],
	init
});
