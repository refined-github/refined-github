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

	const headReferenceLink = select('.head-ref a')!;
	if (!headReferenceLink) {
		return; // Don't return false, if the repo is deleted the CSS will cross it out
	}

	const deletedBranchName = lastBranchAction.textContent!.trim();
	const repoRootUrl = headReferenceLink.href.split('/', 5).join('/');
	for (const element of select.all('.commit-ref')) {
		const branchName = element.textContent!.trim();
		if (branchName === deletedBranchName) {
			element.title = 'This branch has been deleted';

			if (element.classList.contains('head-ref')) {
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
