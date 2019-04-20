/*
The `Projects` sidebar is hidden from repositories and profiles when there are no projects.
The sidebar can't be used to create new projects.
New projects can still be created via the [`Create new…` menu](https://user-images.githubusercontent.com/1402241/34909214-18b6fb2e-f8cf-11e7-8556-bed748596d3b.png).
*/

import select from 'select-dom';
import * as api from '../libs/api';
import features from '../libs/features';
import {getOwnerAndRepo} from '../libs/utils';

async function init(): Promise<false | void> {
	const project = select('[aria-label="Select projects"]');
	if (!project) {
		return false;
	}

	const {ownerName, repoName} = getOwnerAndRepo();
	const {repository} = await api.v4(`
		{
			repository(owner: "${ownerName}", name: "${repoName}") {
				projects(states: [OPEN, CLOSED]){
					totalCount
				}
			}
		}
	`);

	if (repository.projects.totalCount === 0) {
		project.parentElement!.remove();
	}
}

features.add({
	id: 'remove-projects-sidebar',
	include: [
		features.isIssue,
		features.isPRConversation
	],
	load: features.onAjaxedPages,
	init
});
