/*
The `Projects` tab is hidden from repositories and profiles when there are no projects

New projects can still be created via the [`Create new…` menu](https://user-images.githubusercontent.com/1402241/34909214-18b6fb2e-f8cf-11e7-8556-bed748596d3b.png).
*/

import select from 'select-dom';
import features from '../libs/features';
import { safeElementReady } from '../libs/dom-utils';
import * as api from '../libs/api';
import { getOwnerAndRepo } from '../libs/utils';

function buildQuery() {
	const { ownerName, repoName } = getOwnerAndRepo();

	return `{
		repository(owner: "${ownerName}", name: "${repoName}") {
			projects(states: [OPEN, CLOSED]){
      			totalCount
    		}
		}
	}`;
}

async function init() {
	const res = await api.v4(buildQuery())
	const project = await safeElementReady(`
		[aria-label="Select projects"]
	`)

	if (res.repository.projects.totalCount === 0){
		project && project.parentElement!.remove()
	}
}

features.add({
	id: 'remove-projects-sidebar',
	include: [
		features.isIssue,
		features.isPR,
	],
	load: features.onAjaxedPages,
	init
});
