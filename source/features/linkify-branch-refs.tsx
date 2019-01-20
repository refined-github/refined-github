import {React} from 'dom-chef/react';
import select from 'select-dom';
import features from '../libs/features';
import * as pageDetect from '../libs/page-detect';
import {getOwnerAndRepo} from '../libs/utils';
import {safeElementReady, wrap} from '../libs/dom-utils';

function inPR() {
	let deletedBranch = false;
	const lastBranchAction = select.all(`
		.discussion-item-head_ref_deleted .commit-ref,
		.discussion-item-head_ref_restored .commit-ref
	`).pop();
	if (lastBranchAction && lastBranchAction.closest('.discussion-item-head_ref_deleted')) {
		deletedBranch = lastBranchAction.textContent.trim();
	}

	// Find the URLs first, some elements don't have titles
	const urls = new Map();
	for (const el of select.all('.commit-ref[title], .base-ref[title], .head-ref[title]')) {
		const [repo, branch] = el.title.split(':');
		const branchName = el.textContent.trim();
		urls.set(
			el.textContent.trim(),
			`/${repo}`
		);
		if (branchName !== deletedBranch) {
			urls.set(
				el.textContent.trim(),
				`/${repo}/tree/${encodeURIComponent(branch)}`
			);
		}
	}

	for (const el of select.all('.commit-ref')) {
		const branchName = el.textContent.trim();

		if (branchName !== 'unknown repository') {
			if (branchName === deletedBranch) {
				el.title = 'Deleted';
				el.style.textDecoration = 'line-through';
			}

			wrap(el, <a href={urls.get(branchName)}></a>);
		}
	}
}

async function inQuickPR() {
	const el = await safeElementReady('.branch-name');
	if (el) {
		const {ownerName, repoName} = getOwnerAndRepo();
		const branchUrl = `/${ownerName}/${repoName}/tree/${el.textContent}`;
		wrap(el.closest('.branch-name'), <a href={branchUrl}></a>);
	}
}

function init() {
	if (pageDetect.isPR()) {
		inPR();
	} else if (pageDetect.isQuickPR()) {
		inQuickPR();
	}
}

features.add({
	id: 'linkify-branch-refs',
	include: [
		features.isPR,
		features.isQuickPR
	],
	load: features.onAjaxedPages,
	init
});
