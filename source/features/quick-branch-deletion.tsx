import * as pageDetect from 'github-url-detection';

import React from 'dom-chef';

import TrashIcon from 'octicons-plain-react/Trash';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import isDefaultBranch from '../github-helpers/is-default-branch.js';
import {getRepo} from '../github-helpers/index.js';
import showToast from '../github-helpers/toast.js';
import api from '../github-helpers/api.js';
import getCurrentGitRef from '../github-helpers/get-current-git-ref.js';
import {userHasPushAccess} from '../github-helpers/get-user-permission.js';

async function redirectAfterSuccessfulDeletion(): Promise<void> {
	const {nameWithOwner} = getRepo()!;
	const redirectUrl = `/${nameWithOwner}/activity?activity_type=branch_deletion`;
	location.assign(redirectUrl);
}

async function deleteBranch(branchName: string | undefined): Promise<void> {
	if (branchName === undefined) {
		return showToast(new Error('No branch name provided'));
	}

	await api.v3(`git/refs/heads/${branchName}`, {
		method: 'DELETE',
		responseFormat: 'text',
	});
}

async function handleClickDeletion(): Promise<void> {
	const branchName = getCurrentGitRef();

	await showToast(async () => deleteBranch(branchName), {
		message: `Deleting \`${branchName}\` branch`,
		doneMessage: 'Branch correctly deleted, Redirecting ...',
	});

	await redirectAfterSuccessfulDeletion();
}

function attach(container: HTMLElement): void {
	container.append(
		<button
			type="button"
			className="btn btn-sm btn-danger"
			onClick={handleClickDeletion}
		>
			<TrashIcon className="mr-2 tmp-mr-2" />
			Quick deletion branch
		</button>,
	);
}

async function init(signal: AbortSignal): Promise<void> {
	if (!await userHasPushAccess()) {
		return;
	}

	observe('[data-testid="branch-info-bar"] .d-flex.gap-2', attach, {signal});
}

void features.add(import.meta.url, {
	exclude: [
		isDefaultBranch,
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
