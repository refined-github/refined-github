import select from 'select-dom';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';

import features from '.';

function initIssue(): void {
	observe('.gh-header-meta .TableObject-item--primary', {
		add({childNodes}) {
			childNodes[4].textContent = childNodes[4].textContent!.replace('·', '');

			for (const node of [...childNodes].slice(0, 4)) {
				node.remove();
			}
		}
	});
}

function initPR(): void {
	observe('.gh-header-meta .TableObject-item--primary', {
		add(element) {
			const isMerged = select.exists('#partial-discussion-header [title="Status: Merged"]');
			const isSameAuthor = select('.js-discussion > .TimelineItem:first-child .author')?.textContent === select('.author', element)!.textContent;
			const baseBranch = select('.commit-ref:not(.head-ref)', element)!;
			const isDefaultBranch = (baseBranch.firstElementChild as HTMLAnchorElement).pathname.split('/').length === 3;

			for (const node of [...element.childNodes].slice(isSameAuthor ? 0 : 2, isMerged ? 3 : 5)) {
				node.remove();
			}

			if (!isSameAuthor) {
				element.prepend('by ');
			}

			if (isDefaultBranch) {
				baseBranch.remove();
			} else {
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
