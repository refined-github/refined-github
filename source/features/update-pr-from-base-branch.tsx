import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import AlertIcon from 'octicon/alert.svg';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';
import observeElement from '../helpers/simplified-element-observer';
import {getRepoURL, getDiscussionNumber} from '../github-helpers';

let observer: MutationObserver;

function getBranches(): {base: string; head: string} {
	return {
		base: select('.base-ref')!.textContent!.trim(),
		head: select('.head-ref')!.textContent!.trim()
	};
}

async function mergeBranches(): Promise<AnyObject> {
	return api.v3(`repos/${getRepoURL()}/pulls/${getDiscussionNumber()!}/update-branch`, {
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
	} else if (response.message?.toLowerCase().startsWith('merge conflict')) {
		// Only shown on Draft PRs
		statusMeta.textContent = '';
		statusMeta.append(
			<a href={location.pathname + '/conflicts'} className="btn float-right"><AlertIcon/> Resolve conflicts</a>
		);
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
	const [outOfDateContainer] = select.all('.completeness-indicator-problem + .status-heading')
		.filter(title => title.textContent!.includes('out-of-date'));
	if (outOfDateContainer) {
		const meta = outOfDateContainer.nextElementSibling!;
		meta.after(' ', createButton());
		return;
	}

	const {status} = await api.v3(`repos/${getRepoURL()}/compare/${base}...${head}`);
	if (status !== 'diverged') {
		return;
	}

	for (const meta of select.all('.mergeability-details > :not(.js-details-container) .status-meta')) {
		meta.after(' ', createButton());
	}
}

function init(): void | false {
	// Button exists when the current user can merge the PR.
	// Button is disabled when:
	// - There are conflicts (there's already a native "Resolve conflicts" button)
	// - Draft PR (show the button anyway)
	const canMerge = select.exists('[data-details-container=".js-merge-pr"]:not(:disabled)');
	const isDraftPR = select.exists('[action$="ready_for_review"]');
	if (!canMerge && !isDraftPR) {
		return false;
	}

	observer = observeElement('.discussion-timeline-actions', addButton)!;
	delegate(document, '.rgh-update-pr-from-base-branch button', 'click', handler);
}

void features.add({
	id: __filebasename,
	description: 'Adds button to update a PR from the base branch to ensure it builds correctly before merging the PR itself.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/57941992-f2170080-7902-11e9-8f8a-594aad983559.png'
}, {
	include: [
		pageDetect.isPRConversation
	],
	init
});
