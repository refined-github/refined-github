/* eslint-disable @typescript-eslint/camelcase */
import React from 'dom-chef';
import select from 'select-dom';
import delegate, {DelegateEvent} from 'delegate-it';
import features from '../libs/features';
import * as api from '../libs/api';
import observeEl from '../libs/simplified-element-observer';
import {getRepoURL} from '../libs/utils';

function getBranches(): {base: string; head: string} {
	return {
		base: select('.base-ref')!.textContent!.trim(),
		head: select('.head-ref')!.textContent!.trim()
	};
}

export async function mergeBranches() {
	const prBranches = getBranches();
	const result = await api.v3(`repos/${getRepoURL()}/merges`, {
		method: 'POST',
		body: {
			head: prBranches.base,
			base: prBranches.head
		}
	});

	return result.status >= 200 && result.status < 300;
}

async function handler(event: DelegateEvent) {
	const button = event.target as HTMLButtonElement;
	button.disabled = true;
	button.textContent = 'Updating branch…';

	// TODO: show errors to the user
	if (await mergeBranches()) {
		button.remove();
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
		<button type="button" className="btn float-right rgh-update-pr-from-master">
			Update branch
		</button>
	);
}

function init(): void | false {
	// Only if user can merge it. This selects the Merge button, unless it's disabled (because of conflicts or requirements)
	if (!select.exists('[data-details-container=".js-merge-pr"]:not([disabled])')) {
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
