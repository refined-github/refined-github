/*
The `Projects` sidebar is hidden from repositories and profiles when there are no projects.
The sidebar can't be used to create new projects.
New projects can still be created via the [`Create new…` menu](https://user-images.githubusercontent.com/1402241/34909214-18b6fb2e-f8cf-11e7-8556-bed748596d3b.png).
*/

import * as api from '../libs/api';
import features from '../libs/features';
import {getOwnerAndRepo, getDiscussionNumber} from '../libs/utils';
import {safeElementReady} from '../libs/dom-utils';

// let res: {key: Promise<any>};
let res: {[key: string]: {res: Promise<any>, loading: boolean}}

function query() {
	const {ownerName, repoName} = getOwnerAndRepo();
	const number = parseInt(getDiscussionNumber() || "0") //feature include parameters match getdiscussionnumber, so never should it return false
	const repo = repoPick()
	repo.loading = true;
	// projects(states: [OPEN, CLOSED]){
	// 	totalCount
	// }
	repo.res = api.v4(`
		{
			repository(owner: "${ownerName}", name: "${repoName}") {
				issue(number: ${number}){
    				viewerCanUpdate
    			  	projectCards{
    			    	totalCount
    				}
    			}
			}
		}
	`);
}

function repoPick(){
	const { ownerName, repoName } = getOwnerAndRepo();
	return res[ownerName+repoName]
}

async function init(): Promise<false | void> {
	const repo = repoPick()
	if (!repo.loading) {
		query();
	}
	repo.loading = false;
	const project = await safeElementReady('[aria-label="Select projects"]');

	if (!project) {
		return false;
	}
	let {repository: issue} = await repo.res
	console.log(issue)
	if (issue.projectCards.totalCount === 0, !issue.viewerCanUpdate) {
		console.log("removing")
		project.parentElement!.remove();
	}
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
});
