import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import {getRepoURL, getRepoPath} from './utils';

const isWorkflowFile = (): boolean => /\/\.github\/workflows\/.+\.ya?ml$/.test(getRepoPath()!);

function init(): void {
	const actionName =
	select.all('.blob-code-inner')
		.find(line => line.textContent!.startsWith('name'))
		.textContent
		.replace(/^name:\s+/, '')
		.replace(/["']/g, '')
		.trim();

	const actionURL = new URL(`${location.origin}/${getRepoURL()}/actions`);
	actionURL.searchParams.set('query', `workflow:"${actionName}"`);

	select<HTMLAnchorElement>('#raw-url')!
		.parentElement! // `BtnGroup`
		.prepend(
			<a
				className="btn btn-sm BtnGroup-item"
				href={actionURL}
			>
				See runs
			</a>
		);
}

features.add({
	id: __featureName__,
	description: 'Adds a link to access runs of a GitHub Action workflow from the workflow configuration file.',
	screenshot: 'https://user-images.githubusercontent.com/44045911/67634792-48995980-f8fb-11e9-8b6a-7b57d5b12a2f.png'
}, {
	include: [
		isWorkflowFile
	],
	init
});
