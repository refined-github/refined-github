import './vertical-front-matter.css';
import React from 'dom-chef';
import {$$} from 'select-dom';
import * as pageDetect from 'github-url-detection';
import elementReady from 'element-ready';

import features from '../feature-manager.js';

// https://github.com/github/markup/blob/cd01f9ec87c86ce5a7c70188a74ef40fc4669c5b/lib/github/markup/markdown.rb#L34
const hasFrontMatter = (): boolean => pageDetect.isSingleFile() && /\.(mdx?|mkdn?|mdwn|mdown|markdown|litcoffee)$/.test(location.pathname);

async function init(): Promise<false | void> {
	const table = await elementReady('.markdown-body > table:first-child');
	if (!table) {
		return false;
	}

	const headers = $$(':scope > thead th', table);
	if (headers.length <= 4) {
		return false;
	}

	const rows = $$(':scope > tbody > tr', table);
	if (rows.length !== 1 || headers.length !== rows[0].childElementCount) {
		return false;
	}

	const values = [...rows[0].children];
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
		</table>,
	);
}

void features.add(import.meta.url, {
	include: [
		hasFrontMatter,
	],
	deduplicate: '.rgh-vertical-front-matter-table',
	init,
});
