import select from 'select-dom';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';

import features from '.';

function initIssue(): void {
	observe('.gh-header-meta .flex-auto', {
		add({childNodes}) {
			// Removes: octocat opened this issue on 1 Jan [·] 1 comments
			childNodes[4].textContent = childNodes[4].textContent!.replace('·', '');

			// Removes: [octocat opened this issue on 1 Jan] · 1 comments
			for (const node of Array.from(childNodes).slice(0, 4)) {
				node.remove();
			}
		}
	});
}

function initPR(): void {
	observe('.gh-header-meta .flex-auto', {
		add(element) {
			const isMerged = select.exists('#partial-discussion-header [title="Status: Merged"]');
			const isSameAuthor = select('.js-discussion > .TimelineItem:first-child .author')?.textContent === select('.author', element)!.textContent;
			const baseBranch = select('.commit-ref:not(.head-ref)', element)!;
			const isDefaultBranch = (baseBranch.firstElementChild as HTMLAnchorElement).pathname.split('/').length === 3;

			// Removes: [octocat wants to merge 1 commit into] github:master from octocat:feature
			// Removes: [octocat merged 1 commit into] master from feature
			// Removes: octocat [merged 1 commit into] github:master from lovelycat:feature
			for (const node of Array.from(element.childNodes).slice(isSameAuthor ? 0 : 2, isMerged ? 3 : 5)) {
				node.remove();
			}

			// Add "by" if the PR is not merged by the author themselves
			if (!isSameAuthor) {
				element.prepend('by ');
			}

			if (isDefaultBranch) {
				// Removes: octocat wants to merge 1 commit into [github:dev] from octocat:feature
				baseBranch.hidden = true;
			} else {
				// Add back "into" if the PR base branch is not the default branch
				baseBranch.before('into ');
			}
		}
	});
}

void features.add({
	id: __filebasename,
	description: 'Remove duplicate information in conversation headers.',
	screenshot: ''
}, {
	include: [
		pageDetect.isIssue
	],
	init: initIssue,
	repeatOnAjax: false
}, {
	include: [
		pageDetect.isPR
	],
	init: initPR,
	repeatOnAjax: false
});
