import {h} from 'dom-chef';
import select from 'select-dom';
import {safeElementReady} from '../libs/utils';
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
		$(el).closest('.commit-ref').wrap(<a href={branchUrl}></a>);
	}
}

export function inQuickPR() {
	safeElementReady('.branch-name').then(el => {
		if (!el) {
			return;
		}
		const {ownerName, repoName} = pageDetect.getOwnerAndRepo();
		const branchUrl = `/${ownerName}/${repoName}/tree/${el.textContent}`;
		$(el).closest('.branch-name').wrap(<a href={branchUrl}></a>);
	});
}
