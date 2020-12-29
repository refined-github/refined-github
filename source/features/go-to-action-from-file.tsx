import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {buildRepoURL, getRepo} from '../github-helpers';

const isWorkflowFile = (): boolean => pageDetect.isSingleFile() && /\/\.github\/workflows\/.+\.ya?ml$/.test(getRepo()!.path);

function init(): void {
	const actionName = $$('.blob-code-inner')
		.find(line => line.textContent!.startsWith('name'))!
		.textContent!
		.replace(/^name:\s+/, '')
		.replace(/["']/g, '')
		.trim();

	const actionURL = new URL(buildRepoURL('actions'));
	actionURL.searchParams.set('query', `workflow:"${actionName}"`);

	$('#raw-url')!
		.parentElement! // `BtnGroup`
		.prepend(
			<a className="btn btn-sm BtnGroup-item" href={String(actionURL)}>
				Past runs
			</a>
		);
}

void features.add(__filebasename, {
	include: [
		isWorkflowFile
	],
	init
});
