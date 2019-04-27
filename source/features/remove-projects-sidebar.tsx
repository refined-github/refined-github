/*
The projects sidebar can't be used to create new projects, therefore removed if empty and viewer without write access
*/

import * as api from '../libs/api';
import features from '../libs/features';
import {getOwnerAndRepo, getDiscussionNumber} from '../libs/utils';
import {safeElementReady} from '../libs/dom-utils';

type results = {
	[key: string]: result;
}

type result = {
	res?: Promise<any>;
	loading: boolean;
}

const res: results = {};

function query(): void {
	const {ownerName, repoName} = getOwnerAndRepo();
	const number = Number(getDiscussionNumber() || '0'); // Feature include parameters match getdiscussionnumber, so never should it return false
	const repo = repoPick();
	repo.loading = true;
	repo.res = api.v4(`
		{
			repository(owner: "${ownerName}", name: "${repoName}") {
				viewerPermission
				${features.isPR() ? 'pullRequest' : 'issue'}(number: ${number}){
    			  	projectCards{
    			    	totalCount
    				}
    			}
			}
		}
	`);
}

function repoPick(): result {
	const {ownerName, repoName} = getOwnerAndRepo();
	if (!res[ownerName + repoName]) {
		res[ownerName + repoName] = {loading: false};
	}

	return res[ownerName + repoName];
}

async function init(): Promise<false | void> {
	const repo = repoPick();
	if (!repo.loading) {
		query();
	}

	repo.loading = false;
	const project = await safeElementReady('[aria-label="Select projects"]');
	if (!project) {
		return false;
	}

	const {repository} = await repo.res;
	const {viewerPermission} = repository;
	const item = repository.issue ? repository.issue : repository.pullRequest;
	const access = viewerPermission === 'WRITE' || viewerPermission === 'ADMIN';
	if (item.projectCards.totalCount === 0 && !access) {
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
