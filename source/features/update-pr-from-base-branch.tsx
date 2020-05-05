import React from 'dom-chef';
import select from 'select-dom';
import AlertIcon from 'octicon/alert.svg';
import delegate from 'delegate-it';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';
import * as api from '../libs/api';
import observeElement from '../libs/simplified-element-observer';
import {getRepoURL, getDiscussionNumber} from '../libs/utils';

let observer: MutationObserver;

function getBranches(): {base: string; head: string} {
	return {
		base: select('.base-ref')!.textContent!.trim(),
		head: select('.head-ref')!.textContent!.trim()
	};
}

export async function mergeBranches(): Promise<AnyObject> {
	return api.v3(`repos/${getRepoURL()}/pulls/${getDiscussionNumber()!}/update-branch`, {
		method: 'PUT',
		headers: {
			Accept: 'application/vnd.github.lydian-preview+json'
		},
		ignoreHTTPStatus: true
	});
}

async function handler(event: delegate.Event): Promise<void> {
	const button = event.target as HTMLButtonElement;
	button.disabled = true;
	button.textContent = 'Updating branch…';
	button.classList.remove('tooltipped');
	observer.disconnect();

	const response = await mergeBranches();
	if (response.ok) {
		button.remove();
	} else if (response.message?.toLowerCase().startsWith('merge conflict')) {
		// Only shown on Draft PRs
		button.replaceWith(
			<a href={location.pathname + '/conflicts'} className="btn float-right"><AlertIcon/> Resolve conflicts</a>
		);
	} else {
		button.textContent = response.message ?? 'Error';
		button.prepend(<AlertIcon/>, ' ');
		throw new api.RefinedGitHubAPIError('update-pr-from-base-branch: ' + JSON.stringify(response));
	}
}

function createButton(base: string, head: string): HTMLElement {
	return (
		<button type="button" className="btn float-right rgh-update-pr-from-master tooltipped tooltipped-n" aria-label={`Merge the ${base} branch into ${head}`}>
			Update branch
		</button>
	);
}

async function addButton(): Promise<void> {
	if (select.exists('.rgh-update-pr-from-master, .branch-action-btn:not([action$="ready_for_review"]) > .btn')) {
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
		.filter(title => (title.textContent!).includes('out-of-date'));
	if (outOfDateContainer) {
		outOfDateContainer.append(createButton(base, head));
		return;
	}

	const {status} = await api.v3(`repos/${getRepoURL()}/compare/${base}...${head}`);
	if (status !== 'diverged') {
		return;
	}

	for (const heading of select.all('.mergeability-details > :not(.js-details-container) .status-heading')) {
		heading.append(createButton(base, head));
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
	delegate(document, '.rgh-update-pr-from-master', 'click', handler);
}

features.add({
	id: __filebasename,
	description: 'Adds button to update a PR from the base branch to ensure it builds correctly before merging the PR itself.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/57941992-f2170080-7902-11e9-8f8a-594aad983559.png'
}, {
	include: [
		pageDetect.isPRConversation
	],
	init
});
