import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';
import {CodeIcon, FileIcon} from '@primer/octicons-react';

import features from '.';

async function init(): Promise<void> {
	select('#raw-url')!.closest('.d-flex')!.prepend(
		<div className="BtnGroup rgh-view-markdown-source">
			<a
				href="?plain=1"
				aria-label="Display the source blob"
				role="button"
				data-view-component="true"
				className="source tooltipped tooltipped tooltipped-n  btn-sm btn BtnGroup-item"
			>
				<CodeIcon/>
			</a>
			<a
				href={location.pathname}
				aria-label="Display the rendered blob"
				role="button"
				data-view-component="true"
				className="rendered tooltipped tooltipped tooltipped-n btn-sm btn BtnGroup-item"
			>
				<FileIcon/>
			</a>
		</div>,
	);

	const isPlain = new URLSearchParams(location.search).get('plain') === '1';
	select('.rgh-view-markdown-source')!.children[isPlain ? 0 : 1].classList.add('selected');
}

void features.add(__filebasename, {
	include: [
		pageDetect.isSingleFile,
	],
	asLongAs: [
		() => /\.(mdx|mdwn|litcoffee|rst)$/.test(location.pathname),
		() => !select.exists('[href^="?plain=1"]'),
	],
	deduplicate: '.rgh-view-markdown-source', // #3945
	init,
});
