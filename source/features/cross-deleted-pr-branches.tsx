import select from 'select-dom';
import features from '../libs/features';

function init(): void {
	let deletedBranch: string | undefined;
	const lastBranchAction = select.last('.user-select-contain > span:not(.base-ref)');

	if (lastBranchAction?.closest('.TimelineItem-body')?.textContent?.includes('deleted')) {
		deletedBranch = lastBranchAction.textContent!.trim();
	}

	for (const element of select.all('.commit-ref')) {
		const branchName = element.textContent!.trim();
		if (branchName !== 'unknown repository' && branchName === deletedBranch) {
			for (const deletedBranchElement of select.all('span', element)) {
				deletedBranchElement.title = 'Deleted';
				deletedBranchElement.style.textDecoration = 'line-through';
			}
		}
	}
}

features.add({
	id: __featureName__,
	description: 'Adds a line-through to the deleted branches in PRs',
	screenshot: 'https://user-images.githubusercontent.com/16872793/75619638-9bef1300-5b4c-11ea-850e-3a8f95c86d83.png',
	include: [
		features.isPR
	],
	load: features.onAjaxedPages,
	init
});
