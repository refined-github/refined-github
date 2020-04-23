import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import * as pageDetect from '../libs/page-detect';
import {getRepoURL, getRepoPath} from '../libs/utils';

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

features.add({
	id: __filebasename,
	description: 'Adds a link to access runs of a GitHub Action workflow from the workflow configuration file.',
	screenshot: 'https://user-images.githubusercontent.com/8360597/79469826-f3641800-8000-11ea-9f1c-47868c11ce85.png'
}, {
	include: [
		isWorkflowFile
	],
	init
});
