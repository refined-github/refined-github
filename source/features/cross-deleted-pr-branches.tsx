import select from 'select-dom';
import features from '../libs/features';

function init(): void {
	let deletedBranch: string | undefined;
	const lastBranchAction = select.last('.user-select-contain > span:not(.base-ref)');

	if (lastBranchAction?.closest('.TimelineItem-body')?.textContent?.includes('deleted')) {
		deletedBranch = lastBranchAction.textContent!.trim();
	}

	// Adding a linethrough to the branch name
	for (const element of select.all('.commit-ref')) {
		const branchName = element.textContent!.trim();
		if (branchName !== 'unknown repository' && branchName === deletedBranch) {
			const deleteBranchElement = select.last('span', element)!;
			deleteBranchElement.title = 'Deleted';
			deleteBranchElement.style.textDecoration = 'line-through';
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
