import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';

const createRawUrl = (href: string) => href.replace(/blob\//, 'raw/');

function init() {
	const fileActionsGroups: HTMLElement[] = select.all(
		'.file-header .file-actions > div.BtnGroup'
	);

	for (const group of fileActionsGroups) {
		const rawUrl = createRawUrl(group.lastElementChild.getAttribute('href'));
		group.append(
			<a href={rawUrl} class="btn btn-sm BtnGroup-item" rel="nofollow">
				View raw
			</a>
		);
	}
}

features.add({
	id: 'view-raw-file',
	include: [
		features.isCommit,
		features.isCommitList,
		features.isPRFiles
	],
	load: features.onAjaxedPages,
	init
});
