import React from 'dom-chef';
import select from 'select-dom';
import elementReady from 'element-ready';
import features from '../libs/features';
import * as pageDetect from '../libs/page-detect';
import {getOwnerAndRepo} from '../libs/utils';
import {wrap} from '../libs/dom-utils';

function inPR(): void {
	let deletedBranch: string | undefined;
	const lastBranchAction = select.all(`
		.discussion-item-head_ref_deleted .commit-ref,
		.discussion-item-head_ref_restored .commit-ref
	`).pop();
	if (lastBranchAction && lastBranchAction.closest('.discussion-item-head_ref_deleted')) {
		deletedBranch = lastBranchAction.textContent!.trim();
	}

	// Find the URLs first, some elements don't have titles
	const urls = new Map<string, string>();
	for (const el of select.all('.commit-ref[title], .base-ref[title], .head-ref[title]')) {
		const [repo, branch] = el.title.split(':');
		const branchName = el.textContent!.trim();
		urls.set(
			branchName,
			`/${repo}`
		);
		if (branchName !== deletedBranch) {
			urls.set(
				branchName,
				`/${repo}/tree/${encodeURIComponent(branch)}`
			);
		}
	}

	for (const el of select.all('.commit-ref')) {
		const branchName = el.textContent!.trim();

		if (branchName !== 'unknown repository') {
			if (branchName === deletedBranch) {
				el.title = 'Deleted';
				el.style.textDecoration = 'line-through';
			}

			wrap(el, <a href={urls.get(branchName)}></a>);
		}
	}
}

async function inQuickPR(): Promise<void> {
	const el = await elementReady('.branch-name');
	if (el) {
		const {ownerName, repoName} = getOwnerAndRepo();
		const branchUrl = `/${ownerName}/${repoName}/tree/${el.textContent}`;
		wrap(el.closest('.branch-name')!, <a href={branchUrl}></a>);
	}
}

function init(): void {
	if (pageDetect.isPR()) {
		inPR();
	} else if (pageDetect.isQuickPR()) {
		inQuickPR();
	}
}

features.add({
	id: __featureName__,
	description: 'Linkifies branch references in "Quick PR" pages.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/30208043-fa1ceaec-94bb-11e7-9c32-feabcf7db296.png',
	include: [
		features.isPR,
		features.isQuickPR
	],
	load: features.onAjaxedPages,
	init
});
