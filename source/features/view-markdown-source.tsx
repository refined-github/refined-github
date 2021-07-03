import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';
import {CodeIcon, FileIcon} from '@primer/octicons-react';

import features from '.';

async function init(): Promise<void> {
	select('#raw-url')!.closest('.d-flex')!.prepend(
		<div className="BtnGroup">
			<a href="" className="btn btn-sm BtnGroup-item tooltipped tooltipped-nw rgh-md-source" type="button" aria-label="Display the source blob">
				<CodeIcon/>
			</a>
			<a href="" className="btn btn-sm BtnGroup-item tooltipped tooltipped-nw rgh-md-rendered" type="button" aria-label="Display the rendered blob">
				<FileIcon/>
			</a>
		</div>
	);
	const currentURL = new URL(window.location.href);
	const sourceButton = select('a.rgh-md-source')!;
	const renderedButton = select('a.rgh-md-rendered')!;
	if (currentURL.searchParams.has('plain') && currentURL.searchParams.get('plain') === '1') {
		sourceButton.href = currentURL.toString();
		currentURL.searchParams.delete('plain');
		renderedButton.href = currentURL.toString();
		sourceButton.className += ' selected';
	} else {
		renderedButton.href = currentURL.toString();
		currentURL.searchParams.append('plain', '1');
		sourceButton.href = currentURL.toString();
		renderedButton.className += ' selected';
	}
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
