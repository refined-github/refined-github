import './vertical-front-matter.css';
import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';

import features from '.';

// https://github.com/github/markup/blob/cd01f9ec87c86ce5a7c70188a74ef40fc4669c5b/lib/github/markup/markdown.rb#L34
const hasFrontMatter = (): boolean => pageDetect.isSingleFile() && /\.(mdx?|mkdn?|mdwn|mdown|markdown|litcoffee)$/.test(location.pathname);

function init(): void | false {
	const table = $('[data-table-type="yaml-metadata"]')!;
	const headers = table.$$(':scope > thead th');
	if (headers.length <= 4) {
		return false;
	}

	const values = table.$$(':scope > tbody > tr > td');
	table.replaceWith(
		<table className="rgh-vertical-front-matter-table" data-table-type="yaml-metadata">
			<tbody>
				{[...headers].map((cell, index) => (
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
