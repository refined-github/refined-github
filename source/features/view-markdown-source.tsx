import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';
import {CodeIcon, FileIcon} from '@primer/octicons-react';

import features from '.';

async function init(): Promise<void> {
	const URLWithoutSearchParameters = window.location.href.split('?')[0];
	select('#raw-url')!.closest('.d-flex')!.prepend(
		<div className="BtnGroup">
			<a href="?plain=1" className="btn btn-sm BtnGroup-item tooltipped tooltipped-nw rgh-md-source" type="button" aria-label="Display the source blob">
				<CodeIcon/>
			</a>
			<a href={URLWithoutSearchParameters} className="btn btn-sm BtnGroup-item tooltipped tooltipped-nw rgh-md-rendered" type="button" aria-label="Display the rendered blob">
				<FileIcon/>
			</a>
		</div>
	);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isSingleFile
	],
	exclude: [
		() => !(select.exists('.blob .markdown-body') || select.exists('.type-markdown'))
	],
	deduplicate: '.rgh-md-source', // #3945
	init
});
