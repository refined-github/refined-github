import './vertical-front-matter.css';
import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {isMarkdownFile} from '../github-helpers';

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

void features.add(__filebasename, {
	include: [
		() => pageDetect.isSingleFile() && isMarkdownFile()
	],
	init
});
