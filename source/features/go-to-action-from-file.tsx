import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {getRepoURL, getRepoPath} from '../github-helpers';

const isWorkflowFile = (): boolean => pageDetect.isSingleFile() && /\/\.github\/workflows\/.+\.ya?ml$/.test(getRepoPath()!);

function init(): void {
	const actionName = select.all('.blob-code-inner')
		.find(line => line.textContent!.startsWith('name'))!
		.textContent!
		.replace(/^name:\s+/, '')
		.replace(/["']/g, '')
		.trim();

	const actionURL = new URL(`${location.origin}/${getRepoURL()}/actions`);
	actionURL.searchParams.set('query', `workflow:"${actionName}"`);

	select('#raw-url')!
		.parentElement! // `BtnGroup`
		.prepend(
			<a className="btn btn-sm BtnGroup-item" href={String(actionURL)}>
				Past runs
			</a>
		);
}

void features.add({
	id: __filebasename,
	description: 'Adds a link to access the past runs of a GitHub Action workflow when seeing the workflow configuration file.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/80146153-ab6d6400-85b1-11ea-9f38-e87950692a62.png'
}, {
	include: [
		isWorkflowFile
	],
	init
});
