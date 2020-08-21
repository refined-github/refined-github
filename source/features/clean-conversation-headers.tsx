import './clean-conversation-headers.css';
import select from 'select-dom';
import onetime from 'onetime';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';

import features from '.';

function initIssue(): void {
	observe('.gh-header-meta .flex-auto', {
		add({childNodes: bylineNodes}) {
			// Removes: octocat opened this issue on 1 Jan [·] 1 comments
			bylineNodes[4].textContent = bylineNodes[4].textContent!.replace('·', '');

			// Removes: [octocat opened this issue on 1 Jan] · 1 comments
			for (const node of [...bylineNodes].slice(0, 4)) {
				node.remove();
			}
		}
	});
}

function initPR(): void {
	observe('.gh-header-meta .flex-auto:not(.rgh-clean-conversation-header)', {
		add(byline) {
			byline.classList.add('rgh-clean-conversation-header');
			const isMerged = select.exists('#partial-discussion-header [title="Status: Merged"]');
			const isSameAuthor = select('.js-discussion > .TimelineItem:first-child .author')?.textContent === select('.author', byline)!.textContent;
			const baseBranch = select('.commit-ref:not(.head-ref)', byline)!;
			const isDefaultBranch = (baseBranch.firstElementChild as HTMLAnchorElement).pathname.split('/').length === 3;

			// Removes: [octocat wants to merge 1 commit into] github:master from octocat:feature
			// Removes: [octocat merged 1 commit into] master from feature
			// Removes: octocat [merged 1 commit into] github:master from lovelycat:feature
			for (const node of [...byline.childNodes].slice(isSameAuthor ? 0 : 2, isMerged ? 3 : 5)) {
				node.remove();
			}

			if (!isSameAuthor) {
				byline.prepend('by ');
			}

			if (isDefaultBranch) {
				// Removes: octocat wants to merge 1 commit into [github:dev] from octocat:feature
				baseBranch.hidden = true;
			} else {
				// Add back "into" if the PR base branch is not the default branch
				baseBranch.before(' into ');
				baseBranch.classList.add('rgh-clean-conversation-headers-non-default-branch');
			}
		}
	});
}

void features.add({
	id: __filebasename,
	description: 'Remove duplicate information in conversation headers.',
	screenshot: 'https://user-images.githubusercontent.com/44045911/89736767-686ec800-da9e-11ea-81c3-252e9813140b.png'
}, {
	include: [
		pageDetect.isIssue
	],
	waitForDomReady: false,
	init: onetime(initIssue)
}, {
	include: [
		pageDetect.isPR
	],
	waitForDomReady: false,
	init: onetime(initPR)
});
