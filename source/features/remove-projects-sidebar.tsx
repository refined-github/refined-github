/*
The `Projects` sidebar is hidden from repositories and profiles when there are no projects.
The sidebar can't be used to create new projects.
New projects can still be created via the [`Create new…` menu](https://user-images.githubusercontent.com/1402241/34909214-18b6fb2e-f8cf-11e7-8556-bed748596d3b.png).
*/

import * as api from '../libs/api';
import features from '../libs/features';
import {getOwnerAndRepo} from '../libs/utils';
import { safeElementReady } from '../libs/dom-utils';

var loading = false
var res: Promise<any>

function query (){
	const { ownerName, repoName } = getOwnerAndRepo();
	// return await onetime((){}())
	loading = true
	res = api.v4(`
		{
			repository(owner: "${ownerName}", name: "${repoName}") {
				projects(states: [OPEN, CLOSED]){
					totalCount
				}
			}
		}
	`);
	loading = false
}


async function init(): Promise<false | void> {
	if (!loading) {
		query()
	}
	const project = await safeElementReady('[aria-label="Select projects"]')
	if (!project) {
		return false;
	}
	loading = false
	res.then(x => {
		if (x.repository.projects.totalCount === 0) {
			project.parentElement!.remove();
		}
	})
}

features.add({
	id: 'remove-projects-sidebar',
	include: [
		features.isIssue,
		features.isPR
	],
	load: features.onAjaxedPages,
	init
});

features.add({
	id: 'remove-projects-sidebar',
	include: [
		features.isIssue,
		features.isPR
	],
	load: features.onNavigation,
	init: query
})