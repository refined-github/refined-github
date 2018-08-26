import {h} from 'dom-chef';
import select from 'select-dom';
import {safeElementReady, isFeatureEnabled} from '../libs/utils';
import * as pageDetect from '../libs/page-detect';

function inPR() {
	let deletedBranch = false;
	const lastBranchAction = select.all(`
		.discussion-item-head_ref_deleted .commit-ref,
		.discussion-item-head_ref_restored .commit-ref
	`).pop();
	if (lastBranchAction && lastBranchAction.closest('.discussion-item-head_ref_deleted')) {
		deletedBranch = lastBranchAction.textContent.trim();
	}

	for (const el of select.all('.commit-ref')) {
		const branchName = el.textContent.trim();

		if (branchName === deletedBranch) {
			el.title = 'Deleted';
			el.style.textDecoration = 'line-through';
		} else if (branchName !== 'unknown repository') {
			el.onclick = function() {
				document.execCommand("copy");
			};

			el.addEventListener("copy", function(event) {
				event.preventDefault();
				if (event.clipboardData) {
					event.clipboardData.setData("text/plain", branchName);
					console.log("asdf " + branchName);
				}
			});
		}
	}
}

async function inQuickPR() {

	const el = await safeElementReady('.branch-name');
	if (el) {
		const {ownerName, repoName} = pageDetect.getOwnerAndRepo();
		const branchUrl = `/${ownerName}/${repoName}/tree/${el.textContent}`;
		wrap(el.closest('.branch-name'), <a href={branchUrl}></a>);
	}
}

export default function () {

	if (pageDetect.isPR()) {
		inPR();
	} else if (pageDetect.isQuickPR()) {
		inQuickPR();
	}
}
