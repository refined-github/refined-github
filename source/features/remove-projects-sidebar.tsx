/*
The `Projects` sidebar is hidden from repositories and profiles when there are no projects.
The sidebar can't be used to create new projects.
New projects can still be created via the [`Create new…` menu](https://user-images.githubusercontent.com/1402241/34909214-18b6fb2e-f8cf-11e7-8556-bed748596d3b.png).
*/

import * as api from '../libs/api';
import features from '../libs/features';
import {getOwnerAndRepo, getDiscussionNumber} from '../libs/utils';
import {safeElementReady} from '../libs/dom-utils';

let loading = false;
let res: Promise<any>;

function query() {
	const {ownerName, repoName} = getOwnerAndRepo();
	const number = parseInt(getDiscussionNumber() || "0") //feature include parameters match getdiscussionnumber, so never should it return false
	console.log(number)
	loading = true;
	res = api.v4(`
		{
			repository(owner: "${ownerName}", name: "${repoName}") {
				projects(states: [OPEN, CLOSED]){
					totalCount
				}
				issue(number: ${number}){
    				viewerCanUpdate
    			  	projectCards{
    			    	totalCount
    				}
    			}
			}
			organization(login: "${ownerName}"){
			    projects(states: [OPEN, CLOSED]){
        			totalCount
    			}
			}
			user(login: "${ownerName}"){
				projects(states: [OPEN, CLOSED]){
					totalCount
				}
			}
			
		}
	`);
	// res.then(console.log).catch(console.log)
}

async function init(): Promise<false | void> {
	if (!loading) {
		query();
	}
	loading = false;
	const project = await safeElementReady('[aria-label="Select projects"]');

	if (!project) {
		return false;
	}

	loading = false;
	let resolved = await res
	console.log(123, resolved)
	// if (resolved.repository.projects.totalCount === 0) {
	// 	project.parentElement!.remove();
	// }
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
