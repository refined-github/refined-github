import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import {wrap} from '../libs/dom-utils';

function init(): void {
	const lastBranchAction = select.last('.TimelineItem-body .user-select-contain > span:not(.base-ref)');
	if (!lastBranchAction) {
		return;
	}

	if (!lastBranchAction.closest('.TimelineItem-body')!.textContent!.includes('deleted')) {
		return;
	}

	const deletedBranchName = lastBranchAction.textContent!.trim();
	const repoRoot = (select('.head-ref a')! as HTMLAnchorElement).href.replace(/\/tree.*$/, '');

	for (const element of select.all('.commit-ref')) {
		const branchName = element.textContent!.trim();
		if (branchName !== 'unknown repository' && branchName === deletedBranchName) {
			for (const deletedBranchElement of select.all('span', element)) {
				deletedBranchElement.title = 'Deleted';
				deletedBranchElement.style.textDecoration = 'line-through';
				// The head-ref already has an a element
				if (element.classList.contains('head-ref')) {
					const linkElement = select('a', element)!;
					linkElement.href = repoRoot;
					linkElement.style.textDecoration = 'line-through';
					linkElement.classList.remove('no-underline');
				} else {
					wrap(element, <a href={repoRoot}/>);
				}
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
