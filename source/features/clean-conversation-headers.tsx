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
	const isMerged = (header.previousElementSibling!.firstElementChild! as HTMLElement).title === 'Status: Merged';
	const isSameAuthor = select('.js-discussion > .TimelineItem:first-child .author')!.textContent === header.firstElementChild!.textContent;
	const baseBranch = header.childNodes[isMerged ? 3 : 5];
	const isDefaultBranch = (baseBranch.firstChild! as HTMLAnchorElement).pathname.split('/').length === 3;
	const childNodes = [...header.childNodes].slice(isMerged ? 5 : 9);
	header.replaceWith(
		<div className="TableObject-item TableObject-item--primary">
			{!isSameAuthor && <>by {header.firstElementChild} </>}
			{!isDefaultBranch && <>into {baseBranch}</>}
			{...childNodes}
		</div>
	);
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
