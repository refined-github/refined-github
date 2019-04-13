import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';

import slugify from 'slugify';
import {getOwnerAndRepo} from '../libs/utils'
import {getDefaultBranchObject} from "../libs/get-default-branch-object";
import {createBranch} from "../libs/create-branch";


function getIssueName(): string {
	return select('.js-issue-title').innerText;
}

function newBranchFromIssue() {
	(async () => {
		const {ownerName, repoName} = getOwnerAndRepo();
		const defaultBranchObject = await getDefaultBranchObject(ownerName, repoName);
		const slug = slugify(getIssueName());

		createBranch(ownerName, repoName, slug, defaultBranchObject.sha)
			.finally(() => {
				window.location.href = `${ownerName}/${repoName}/tree/${slug}`
			})

	})()
}

function addNewBranchFromIssueButton() {
	if (!select.exists('.rgh-btn-new-branch-from-issue')) {
		const button = <button class="btn btn-sm btn-primary float-right rgh-btn-new-branch-from-issue">New
			branch</button>;
		button.addEventListener('click', newBranchFromIssue, {
			once: true
		});
		select('.gh-header-actions').append(button);
	}
}

async function init() {
	addNewBranchFromIssueButton()
}

features.add({
	id: 'new-branch-from-issue-button',
	include: [
		features.isIssue
	],
	load: features.onAjaxedPages,
	init
});
