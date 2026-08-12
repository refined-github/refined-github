import * as pageDetect from 'github-url-detection';

import React from 'dom-chef';

import TrashIcon from 'octicons-plain-react/Trash';

import delegate from 'delegate-it';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import isDefaultBranch from '../github-helpers/is-default-branch.js';
import {buildRepoUrl} from '../github-helpers/index.js';
import showToast from '../github-helpers/toast.js';
import api from '../github-helpers/api.js';
import getCurrentGitRef from '../github-helpers/get-current-git-ref.js';
import {userHasPushAccess} from '../github-helpers/get-user-permission.js';

async function redirectAfterSuccessfulDeletion(): Promise<void> {
	const redirectUrl = buildRepoUrl('activity?activity_type=branch_deletion');
	location.assign(redirectUrl);
}

async function quickBranchDeletion(branchName: string | undefined): Promise<void> {
	if (branchName === undefined) {
		throw new Error('Missing branch name');
	}

	await api.v3(`git/refs/heads/${branchName}`, {
		method: 'DELETE',
		responseFormat: 'text',
	});
}

async function handleClickDeletion(): Promise<void> {
	const branchName = getCurrentGitRef();

	await showToast(async () => quickBranchDeletion(branchName), {
		message: `Deleting \`${branchName}\` branch`,
		doneMessage: 'Branch deleted. Redirecting…',
	});

	await redirectAfterSuccessfulDeletion();
}

function attach(container: HTMLElement): void {
	container.prepend(
		<button
			type="button"
			className="btn btn-sm btn-danger rgh-quick-branch-deletion"
		>
			<TrashIcon className="mr-2 tmp-mr-2" />
			Delete branch
		</button>,
	);
}

async function init(signal: AbortSignal): Promise<void> {
	observe('[data-testid="branch-info-bar"] .d-flex.gap-2', attach, {signal});
	delegate('.rgh-quick-branch-deletion', 'click', handleClickDeletion, {signal});
}

void features.add(import.meta.url, {
	exclude: [
		isDefaultBranch,
	],
	asLongAs: [
		userHasPushAccess,
	],
	include: [
		pageDetect.isRepoTree,
	],
	init,
});

/*
Test URLs:

1. https://github.com/refined-github/refined-github/tree/sandbox/keep-branch

*/
