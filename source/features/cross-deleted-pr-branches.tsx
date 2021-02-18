import './cross-deleted-pr-branches.css';
import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import {wrap} from '../helpers/dom-utils';
import features from '.';

function init(): void | false {
	const lastBranchAction = select.last('.TimelineItem-body .user-select-contain > span:not(.base-ref)');
	if (!lastBranchAction) {
		return false;
	}

	if (!lastBranchAction.closest('.TimelineItem-body')!.textContent!.includes(' deleted ')) {
		return false;
	}

	const deletedBranchName = lastBranchAction.textContent!.trim();

	const headReferenceLink = select('.head-ref a')!;
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

void features.add(__filebasename, {
	include: [
		pageDetect.isPRConversation
	],
	init
});
