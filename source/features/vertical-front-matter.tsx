import './vertical-front-matter.css';
import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

// https://github.com/github/markup/blob/cd01f9ec87c86ce5a7c70188a74ef40fc4669c5b/lib/github/markup/markdown.rb#L34
const hasFrontMatter = (): boolean => pageDetect.isSingleFile() && /\.(mdx?|mkdn?|mdwn|mdown|markdown|litcoffee)$/.test(location.pathname);

function init(): void | false {
	const table = select('.markdown-body > table:first-child');
	if (!table) {
		return false;
	}

	const headRow = select(':scope > thead > tr', table)!;
	const bodyRows = select.all(':scope > tbody > tr', table);
	if (bodyRows.length !== 1 || headRow.childElementCount !== bodyRows[0].childElementCount) {
		return false;
	}

	const headers = select.all(':scope > thead th', table);
	if (headers.length <= 4) {
		return false;
	}

	const values = select.all(':scope > tbody > tr > td', table);
	table.replaceWith(
		<table className="rgh-vertical-front-matter-table">
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

void features.add(__filebasename, {
	include: [
		hasFrontMatter
	],
	init
});
