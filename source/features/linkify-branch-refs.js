import {h} from 'dom-chef';
import select from 'select-dom';
import {safeElementReady, wrap} from '../libs/utils';
import * as pageDetect from '../libs/page-detect';

export function inPR() {
	let deletedBranch = false;
	const lastBranchAction = select.all(`
		.discussion-item-head_ref_deleted .head-ref,
		.discussion-item-head_ref_restored .head-ref
	`).pop();
	if (lastBranchAction && lastBranchAction.closest('.discussion-item-head_ref_deleted')) {
		deletedBranch = lastBranchAction.title;
	}

	for (const el of select.all('.commit-ref[title], .base-ref[title], .head-ref[title]')) {
		if (el.textContent === 'unknown repository') {
			continue;
		}

		if (el.title === deletedBranch) {
			el.title = 'Deleted: ' + el.title;
			el.style.textDecoration = 'line-through';
			continue;
		}

		const branchUrl = '/' + el.title.replace(':', '/tree/');
		wrap(el.closest('.commit-ref'), <a href={branchUrl}></a>);
	}
}

export async function inQuickPR() {
	const el = await safeElementReady('.branch-name');
	if (el) {
		const {ownerName, repoName} = pageDetect.getOwnerAndRepo();
		const branchUrl = `/${ownerName}/${repoName}/tree/${el.textContent}`;
		wrap(el.closest('.branch-name'), <a href={branchUrl}></a>);
	}
}
