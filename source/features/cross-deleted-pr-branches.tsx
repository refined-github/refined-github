import select from 'select-dom';
import features from '../libs/features';
import * as pageDetect from '../libs/page-detect';

function init(): void {
	if (!pageDetect.isPR()) {
		return;
	}

	let deletedBranch: string | undefined;
	const lastBranchAction = select.last(`
		.discussion-item-head_ref_deleted .commit-ref,
		.discussion-item-head_ref_restored .commit-ref
    `);

	if (lastBranchAction && lastBranchAction.closest('.discussion-item-head_ref_deleted')) {
		deletedBranch = lastBranchAction.textContent!.trim();
	}

	// Point the deleted branch link to the default branch
	for (const element of select.all('.commit-ref[title].head-ref[title]')) {
		const [repo] = element.title.split(':', 1);
		const branchName = element.textContent!.trim();
		if (branchName !== 'unknown repository' && branchName === deletedBranch) {
			const deletedBranchHTMLElement = element.children[0] as HTMLLinkElement;
			deletedBranchHTMLElement.href = `${branchName}/${repo}`;
		}
	}

	// Adding a linethrough to the branch name
	for (const element of select.all('.commit-ref')) {
		const branchName = element.textContent!.trim();

		if (branchName !== 'unknown repository') {
			if (branchName === deletedBranch) {
				if (element.classList.contains('head-ref')) {
					const deletedBranchElement = element.children[0].children;
					for (const item of deletedBranchElement) {
						const itemHTMLElement = item as HTMLElement;
						itemHTMLElement.style.textDecoration = 'line-through';
					}
				}

				element.title = 'Deleted';
				element.style.textDecoration = 'line-through';
			}
		}
	}
}

features.add({
	id: __featureName__,
	description: 'Adds a line-through to the deleted branches in PRs',
	screenshot: 'https://user-images.githubusercontent.com/30543444/63117366-480a4b80-bfb9-11e9-949f-f624c8f0485c.png',
	include: [
		features.isPR
	],
	load: features.onAjaxedPages,
	init
});
