import * as pageDetect from 'github-url-detection';
import {isForkedRepo} from 'github-url-detection';

import React from 'dom-chef';

import TrashIcon from 'octicons-plain-react/Trash';

import delegate from 'delegate-it';

import {$} from 'select-dom';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import isDefaultBranch from '../github-helpers/is-default-branch.js';
import {buildRepoUrl, getRepo} from '../github-helpers/index.js';
import showToast from '../github-helpers/toast.js';
import api from '../github-helpers/api.js';
import getCurrentGitRef from '../github-helpers/get-current-git-ref.js';
import {userHasPushAccess} from '../github-helpers/get-user-permission.js';

function getNetworkRootRepository(): string | undefined {
	const meta = $('meta[name="octolytics-dimension-repository_parent_nwo"]', document);
	const attribute = meta.getAttribute('content');
	return attribute ?? undefined;
}

async function branchHasNoOpenPullRequest(): Promise<boolean> {
	const branchName = getCurrentGitRef();

	if (!branchName) {
		return false;
	}

	const {owner, nameWithOwner} = getRepo()!;
	const targetRepository = isForkedRepo() ? getNetworkRootRepository() : nameWithOwner;

	const pullRequests = await api.v3(
		`/repos/${targetRepository}/pulls?head=${owner}:${branchName}&state=open`,
	);

	return pullRequests.length === 0;
}

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
	const {nameWithOwner} = getRepo()!;

	if (confirm(`\`${branchName}\` on ${nameWithOwner} will be deleted. Are you sure?`)) {
		await showToast(async () => quickBranchDeletion(branchName), {
			message: `Deleting \`${branchName}\` branch`,
			doneMessage: 'Branch deleted. Redirecting…',
		});

		await redirectAfterSuccessfulDeletion();
	}
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
		branchHasNoOpenPullRequest,
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
