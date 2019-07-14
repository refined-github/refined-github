import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import * as icons from '../libs/icons';
import {getRepoURL} from '../libs/utils';

async function init(): Promise<void | false> {
	// Detect if we are on the repo homepage, and readme file exists.
	const readmeHeader = select('#readme .Box-header h3');
	if (!readmeHeader) {
		return false;
	}

	// The button already exists on repos you can push to.
	if (select.exists('a[aria-label="Edit this file"]')) {
		return false;
	}

	const currentBranch = select('#branch-select-menu .css-truncate-target')!.textContent!.trim();
	const readmeName = readmeHeader.textContent!.trim();
	const path = select('.breadcrumb')!.textContent!.trim().split('/').slice(1).join('/');
	readmeHeader.after(
		<a href={`/${getRepoURL()}/edit/${currentBranch}/${path}${readmeName}`}
			className="Box-btn-octicon btn-octicon float-right"
			aria-label="Edit this file">
			{icons.edit()}
		</a>
	);
}

features.add({
	id: __featureName__,
	description: 'Quickly edit a repository’s README from the repository root',
	include: [
		features.isRepoRoot,
		features.isRepoTree
	],
	load: features.onAjaxedPages,
	init
});
