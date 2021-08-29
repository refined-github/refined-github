import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';
import {CodeIcon, FileIcon} from '@primer/octicons-react';

import features from '.';

async function init(): Promise<void> {
	const isPlain = new URLSearchParams(location.search).get('plain') === '1';
	select('#raw-url')!.closest('.d-flex')!.prepend(
		<div className="BtnGroup rgh-view-markdown-source mr-1">
			<a
				href="?plain=1"
				data-pjax="#repo-content-pjax-container"
				className="btn btn-sm BtnGroup-item tooltipped tooltipped-nw"
				aria-label="Display the source"
			>
				<CodeIcon/>
			</a>
			<a
				href={location.pathname}
				data-pjax="#repo-content-pjax-container"
				className="btn btn-sm BtnGroup-item tooltipped tooltipped-nw"
				aria-label="Display the rendered file"
			>
				<FileIcon/>
			</a>
		</div>,
	);

	select('.rgh-view-markdown-source')!.children[isPlain ? 0 : 1].classList.add('selected');
}

void features.add(__filebasename, {
	include: [
		() => pageDetect.isSingleFile() && /\.(mdx?|mkdn?|mdwn|mdown|markdown|litcoffee)$/.test(location.pathname),
	],
	deduplicate: '.rgh-view-markdown-source', // #3945
	init,
});
