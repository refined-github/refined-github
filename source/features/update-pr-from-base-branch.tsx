/* eslint-disable @typescript-eslint/camelcase */
import React from 'dom-chef';
import select from 'select-dom';
import delegate, {DelegateEvent} from 'delegate-it';
import features from '../libs/features';
import * as api from '../libs/api';
import observeEl from '../libs/simplified-element-observer';
import {getRepoURL} from '../libs/utils';
import {alert} from '../libs/icons';

function getBranches(): {base: string; head: string} {
	return {
		base: select('.base-ref')!.textContent!.trim(),
		head: select('.head-ref')!.textContent!.trim()
	};
}

export async function mergeBranches(): Promise<AnyObject> {
	const prBranches = getBranches();
	return api.v3(`repos/${getRepoURL()}/merges`, {
		method: 'POST',
		body: {
			head: prBranches.base,
			base: prBranches.head
		},
		ignoreHTTPStatus: true
	});
}

async function handler(event: DelegateEvent) {
	const button = event.target as HTMLButtonElement;
	button.disabled = true;
	button.textContent = 'Updating branch…';
	button.setAttribute('aria-label', '...');

	const response = await mergeBranches();
	if (response.status && response.status < 300) {
		button.remove();
	} else if (response.message) {
		button.textContent = response.message;
		button.prepend(alert(), ' ');
		if (response.message === 'Merge conflict') { // Only shown on Draft PRs
			button.setAttribute('aria-label', 'Set PR as "Read for review" or merge on your computer');
		} // TODO: handle more errors
	}
}

async function addButton(): Promise<void> {
	if (select.exists('.rgh-update-pr-from-master')) {
		return;
	}

	const stillLoading = select('#partial-pull-merging poll-include-fragment');
	if (stillLoading) {
		stillLoading.addEventListener('load', addButton);
		return;
	}

	const {base, head} = getBranches();
	const {behind_by} = await api.v3(`repos/${getRepoURL()}/compare/${base}...${head}`);
	if (behind_by === 0) {
		return;
	}

	select('.mergeability-details .merge-message')!.append(
		<button type="button" className="btn float-right rgh-update-pr-from-master tooltipped tooltipped-n" aria-label={`Merge the ${base} branch into ${head}`}>
			Update branch
		</button>
	);
}

function init(): void | false {
	const mergeButton = select<HTMLButtonElement>('[data-details-container=".js-merge-pr"]');
	// Only if user can merge it
	if (!mergeButton) {
		return false;
	}

	// Button is disabled when:
	// - There are conflicts (there's already a native "Resolve conflicts" button)
	// - Draft PR (show the button anyway)
	if (mergeButton.disabled && !select.exists('[action$="ready_for_review"]')) {
		return false;
	}

	// API doesn't support cross-fork merges
	if (getBranches().base.includes(':')) {
		return false;
	}

	observeEl('.discussion-timeline-actions', addButton);
	delegate('.discussion-timeline-actions', '.rgh-update-pr-from-master', 'click', handler);
}

features.add({
	id: 'update-pr-from-base-branch',
	include: [
		features.isPRConversation
	],
	load: features.onAjaxedPages,
	init
});
