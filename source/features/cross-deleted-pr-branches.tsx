import './cross-deleted-pr-branches.css';
import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';
import {wrap} from '../libs/dom-utils';

function init(): void {
	const lastBranchAction = select.last('.TimelineItem-body .user-select-contain > span:not(.base-ref)');
	if (!lastBranchAction) {
		return;
	}

	if (!lastBranchAction.closest('.TimelineItem-body')!.textContent!.includes(' deleted ')) {
		return;
	}

	const deletedBranchName = lastBranchAction.textContent!.trim();

	const headReferenceLink = select<HTMLAnchorElement>('.head-ref a')!;
	const repoRootUrl = headReferenceLink.href.split('/', 5).join('/');
	const repoIsDeleted = headReferenceLink.textContent === 'unknown repository';

	for (const element of select.all('.commit-ref')) {
		const branchName = element.textContent!.trim();
		if (branchName === deletedBranchName || branchName === 'unknown repository') {
			element.title = 'Deleted';

			if (repoIsDeleted) {
				select('a', element)?.removeAttribute('href');
			} else if (element.classList.contains('head-ref')) {
				select('a', element)!.href = repoRootUrl;
			} else {
				wrap(element, <a href={repoRootUrl}/>);
			}
		}
	}
}

features.add({
	id: __filebasename,
	description: 'Adds a line-through to the deleted branches in PRs',
	screenshot: 'https://user-images.githubusercontent.com/16872793/75619638-9bef1300-5b4c-11ea-850e-3a8f95c86d83.png'
}, {
	include: [
		pageDetect.isPRConversation
	],
	init
});
