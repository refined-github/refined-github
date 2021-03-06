/** @jsx h */
import {h} from 'preact';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import render from '../helpers/render';

import features from '.';
import {buildRepoURL, getRepo} from '../github-helpers';

const isWorkflowFile = (): boolean => pageDetect.isSingleFile() && /\/\.github\/workflows\/.+\.ya?ml$/.test(getRepo()!.path);

function init(): void {
	const actionName = select.all('.blob-code-inner')
		.find(line => line.textContent!.startsWith('name'))!
		.textContent!
		.replace(/^name:\s+/, '')
		.replace(/["']/g, '')
		.trim();

	const actionURL = new URL(buildRepoURL('actions'));
	actionURL.searchParams.set('query', `workflow:"${actionName}"`);

	select('#raw-url')!
		.parentElement! // `BtnGroup`
		.prepend(render(
			<a className="btn btn-sm BtnGroup-item" href={String(actionURL)}>
				Past runs
			</a>
		));
}

void features.add(__filebasename, {
	include: [
		isWorkflowFile
	],
	init
});
