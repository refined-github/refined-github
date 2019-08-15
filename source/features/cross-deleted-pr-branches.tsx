import select from 'select-dom';
import features from '../libs/features';
import * as pageDetect from '../libs/page-detect';

function inPR(): void {
    let deletedBranch: string | undefined;
    const lastBranchAction = select.all(`
		.discussion-item-head_ref_deleted .commit-ref,
		.discussion-item-head_ref_restored .commit-ref
    `).pop();

    if (lastBranchAction && lastBranchAction.closest('.discussion-item-head_ref_deleted')) {
		deletedBranch = lastBranchAction.textContent!.trim();
    }

	// Making deleted branch link to the default fork
	for (const el of select.all('.commit-ref[title].head-ref[title]')) {
        const [repo] = el.title.split(':', 1);
		const branchName = el.textContent!.trim();
		if (branchName !== 'unknown repository') {
			if (branchName === deletedBranch) {
				el.children[0].setAttribute('href', `${branchName}/${repo}`);
			}
		}
	}

	// Adding a linethrough to the branch name
	for (const el of select.all('.commit-ref')) {
		const branchName = el.textContent!.trim();

		if (branchName !== 'unknown repository') {
			if (branchName === deletedBranch) {
				if ( el.classList.contains('head-ref')) {
					let deletedBranchElement = el.children[0].children;
					for (let item of deletedBranchElement) {
						item.setAttribute('style', 'text-decoration: line-through;');
					}
				}
				el.title = 'Deleted';
				el.style.textDecoration = 'line-through';
			}
		}
	}
}

function init(): void {
    if (pageDetect.isPR()) {
        inPR();
    }
}

features.add({
	id: __featureName__,
	description: 'Adds a line-through to the deleted branches',
	screenshot: 'URL-HERE',
	include: [
		features.isPR
	],
	load: features.onAjaxedPages,
	init
});