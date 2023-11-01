import './cross-deleted-pr-branches.css';
import React from 'dom-chef';
import {$, $$, lastElement} from 'select-dom';
import * as pageDetect from 'github-url-detection';

import {wrap} from '../helpers/dom-utils.js';
import features from '../feature-manager.js';

function init(): void | false {
	const lastBranchAction = lastElement('.TimelineItem-body .user-select-contain.commit-ref');

	const headReferenceLink = $('.head-ref a');
	if (!headReferenceLink && !lastBranchAction) {
		return; // Don't return false, This feature’s CSS already takes care of this
	}

	if (!lastBranchAction?.closest('.TimelineItem-body')!.textContent.includes(' deleted ')) {
		return false;
	}

	const deletedBranchName = lastBranchAction.textContent.trim();
	const repoRootUrl = headReferenceLink?.href.split('/', 5).join('/');
	for (const element of $$('.commit-ref')) {
		const branchName = element.textContent.trim();
		if (branchName === deletedBranchName) {
			element.title = 'This branch has been deleted';

			if (!headReferenceLink) {
				continue;
			}

			if (element.classList.contains('head-ref')) {
				$('a', element)!.href = repoRootUrl!;
			} else {
				wrap(element, <a href={repoRootUrl}/>);
			}
		}
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRConversation,
	],
	deduplicate: 'has-rgh-inner',
	awaitDomReady: true, // Must wait for the last one
	init,
});
