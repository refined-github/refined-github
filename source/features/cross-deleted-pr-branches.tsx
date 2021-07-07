import './cross-deleted-pr-branches.css';
import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import {wrap} from '../helpers/dom-utils';
import features from '.';

function init(): void | false {
	const lastBranchAction = select.last('.TimelineItem-body .user-select-contain.commit-ref');

	const headReferenceLink = select('.head-ref a');
	if (!headReferenceLink && !lastBranchAction) {
		return; // Don't return false, This feature’s CSS already takes care of this
	}

	if (!lastBranchAction?.closest('.TimelineItem-body')!.textContent!.includes(' deleted ')) {
		return false;
	}

	const deletedBranchName = lastBranchAction.textContent!.trim();
	const repoRootUrl = headReferenceLink?.href.split('/', 5).join('/');
	for (const element of select.all('.commit-ref')) {
		const branchName = element.textContent!.trim();
		if (branchName === deletedBranchName) {
			element.title = 'This branch has been deleted';

			if (!headReferenceLink) {
				continue;
			}

			if (element.classList.contains('head-ref')) {
				select('a', element)!.href = repoRootUrl!;
			} else {
				wrap(element, <a href={repoRootUrl}/>);
			}
		}
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.isPRConversation,
	],
	init,
});
