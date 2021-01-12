import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import {AlertIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';
import observeElement from '../helpers/simplified-element-observer';
import {getConversationNumber} from '../github-helpers';

let observer: MutationObserver;

function getBranches(): {base: string; head: string} {
	return {
		base: select('.base-ref')!.textContent!.trim(),
		head: select('.head-ref')!.textContent!.trim()
	};
}

async function mergeBranches(): Promise<AnyObject> {
	return api.v3(`pulls/${getConversationNumber()!}/update-branch`, {
		method: 'PUT',
		headers: {
			Accept: 'application/vnd.github.lydian-preview+json'
		},
		ignoreHTTPStatus: true
	});
}

async function handler({delegateTarget}: delegate.Event): Promise<void> {
	const {base, head} = getBranches();
	if (!confirm(`Merge the ${base} branch into ${head}?`)) {
		return;
	}

	const statusMeta = delegateTarget.parentElement!;
	statusMeta.textContent = 'Updating branch…';
	observer.disconnect();

	const response = await mergeBranches();
	if (response.ok) {
		statusMeta.remove();
	} else {
		statusMeta.textContent = response.message ?? 'Error';
		statusMeta.prepend(<AlertIcon/>, ' ');
		throw new api.RefinedGitHubAPIError('update-pr-from-base-branch: ' + JSON.stringify(response));
	}
}

function createButton(): HTMLElement {
	const button = <button type="button" className="btn-link">update the base branch</button>;
	return <span className="status-meta rgh-update-pr-from-base-branch">You can {button}.</span>;
}

async function addButton(): Promise<void> {
	if (select.exists('.rgh-update-pr-from-base-branch, .branch-action-btn:not([action$="ready_for_review"]) > .btn')) {
		return;
	}

	const stillLoading = select('#partial-pull-merging poll-include-fragment');
	if (stillLoading) {
		stillLoading.addEventListener('load', addButton);
		return;
	}

	const {base, head} = getBranches();

	if (head === 'unknown repository') {
		return;
	}

	// Draft PRs already have this info on the page
	const outOfDateContainer = select.all('.completeness-indicator-problem + .status-heading')
		.find(title => title.textContent!.includes('out-of-date'));
	if (outOfDateContainer) {
		const meta = outOfDateContainer.nextElementSibling!;
		meta.after(' ', createButton());
		return;
	}

	const {status} = await api.v3(`compare/${base}...${head}`);
	if (status !== 'diverged') {
		return;
	}

	for (const meta of select.all('.mergeability-details > :not(.js-details-container) .status-meta')) {
		meta.after(' ', createButton());
	}
}

async function init(): Promise<void | false> {
	await api.expectToken();

	// This link does the same thing as this feature: Updates the head branch from the base
	const hasResolveConflictsLink = select.exists('.js-merge-pr a[href$="/conflicts"]');
	const currentUserCanPush = select.exists('.merge-pr > .text-gray:first-child');
	if (!currentUserCanPush || hasResolveConflictsLink) {
		return false;
	}

	observer = observeElement('.discussion-timeline-actions', addButton)!;
	delegate(document, '.rgh-update-pr-from-base-branch button', 'click', handler);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isPRConversation
	],
	init
});
