import './vertical-front-matter.css';
import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

// https://github.com/github/markup/blob/cd01f9ec87c86ce5a7c70188a74ef40fc4669c5b/lib/github/markup/markdown.rb#L34
const hasFrontMatter = (): boolean => pageDetect.isSingleFile() && /\.(mdx?|mkdn?|mdwn|mdown|markdown|litcoffee)$/.test(location.pathname);

function init(): void | false {
	const table = select('[data-table-type="yaml-metadata"]')!;
	const headers = select.all(':scope > thead th', table);
	if (headers.length <= 4) {
		return false;
	}

	const values = select.all(':scope > tbody > tr > td', table);
	table.replaceWith(
		<table className="rgh-vertical-front-matter-table" data-table-type="yaml-metadata">
			<tbody>
				{headers.map((cell, index) => (
					<tr>
						{cell}
						{values[index]}
					</tr>
				))}
			</tbody>
		</table>
	);
}

void features.add({
	id: __filebasename,
	description: 'Shows Markdown front matter as vertical table.',
	screenshot: 'https://user-images.githubusercontent.com/44045911/87251695-26069b00-c4a0-11ea-9077-53ce366490ed.png'
}, {
	include: [
		hasFrontMatter
	],
	init
});
