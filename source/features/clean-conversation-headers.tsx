import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

function initIssue(): void {
	const {childNodes} = select('.gh-header-meta .TableObject-item--primary')!;

	childNodes[4].textContent = childNodes[4].textContent!.replace('·', '');

	for (const node of [...childNodes].slice(0, 4)) {
		node.remove();
	}
}

function initPR(): void {
	const header = select('.gh-header-meta .TableObject-item--primary')!;
	const isMerged = select.exists('#partial-discussion-header [title="Status: Merged"]');
	const isSameAuthor = select('.js-discussion > .TimelineItem:first-child .author')?.textContent === select('.author', header)!.textContent;
	const baseBranch = select('.commit-ref:not(.head-ref)', header)!;
	const isDefaultBranch = (baseBranch.firstElementChild as HTMLAnchorElement).pathname.split('/').length === 3;

	for (const node of [...header.childNodes].slice(isSameAuthor ? 0 : 2, isMerged ? 3 : 5)) {
		node.remove();
	}

	if (!isSameAuthor) {
		header.firstElementChild!.before('by ');
	}

	if (isDefaultBranch) {
		baseBranch.remove();
	} else {
		baseBranch.before('into ');
	}
}

void features.add({
	id: __filebasename,
	description: '',
	screenshot: ''
}, {
	include: [
		pageDetect.isIssue
	],
	init: initIssue
}, {
	include: [
		pageDetect.isPR
	],
	init: initPR
});
