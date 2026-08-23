import * as pageDetect from 'github-url-detection';
import React from 'dom-chef';
import TrashIcon from 'octicons-plain-react/Trash';
import delegate from 'delegate-it';
import {elementExists} from 'select-dom';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import {buildRepoUrl} from '../github-helpers/index.js';
import showToast from '../github-helpers/toast.js';
import api from '../github-helpers/api.js';
import getCurrentGitRef from '../github-helpers/get-current-git-ref.js';
import {withTooltipRef} from '../components/tooltip.js';

async function deleteBranch(branchName: string): Promise<void> {
	await api.v3(`git/refs/heads/${encodeURIComponent(branchName)}`, {
		method: 'DELETE',
		responseFormat: 'text',
	});

	const redirectUrl = buildRepoUrl('activity?activity_type=branch_deletion');
	location.assign(redirectUrl);
}

async function handleClickDeletion(): Promise<void> {
	const branchName = getCurrentGitRef()!;

	if (!confirm(`\`${branchName}\` will be deleted. Are you sure?`)) {
		return;
	}

	await showToast(async () => deleteBranch(branchName), {
		message: `Deleting \`${branchName}\` branch`,
		doneMessage: 'Branch deleted. Redirecting…',
	});
}

function add(contributeContainer: HTMLElement): void {
	if (elementExists([
		// No button if there are open PRs
		'a[class*="PullRequestLink-module"]',
		// No button if the branch is linked to upstream repo (generally the main branch)
		'.octicon-sync',
	], contributeContainer)) {
		return;
	}

	contributeContainer.prepend(
		<button
			type="button"
			className="btn btn-danger rgh-delete-branch"
			ref={withTooltipRef('Delete branch')}
		>
			<TrashIcon/>
		</button>,
	);
}

async function init(signal: AbortSignal): Promise<void> {
	// This bar does not appear on the default branch of the root repo, so no further checks are required
	// The element is empty if the user doesn't have push access
	observe('[data-testid="branch-info-bar"] > .d-flex.gap-2:not(:empty)', add, {signal});
	delegate('.rgh-delete-branch', 'click', handleClickDeletion, {signal});
}

void features.add(import.meta.url, {
	asLongAs: [
		pageDetect.isRepoRoot,
	],
	requiresToken: true,
	init,
});

/*
Test URLs:

Deletable branch: https://github.com/refined-github/sandbox/tree/delete-and-recreate-this-branch
Can't, default branch: https://github.com/bfred-it-org/github-sandbox/tree/main
Can't, open PR: https://github.com/refined-github/sandbox/tree/sdfsdfds
Can't, open PR on fork: https://github.com/bfred-it-org/github-sandbox/tree/branch/for-pr
Can't, lack of permissions: https://github.com/gulpjs/vinyl/tree/before-rebase

*/
