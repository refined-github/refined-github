import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import {file} from '../libs/icons';
import {getRepoPath} from '../libs/utils';
import {groupSiblings} from '../libs/group-buttons';

function init(): void | false {
	// /user/repo/commits/master/readme.md -> 'readme.md'
	// /user/repo/commits/master/          -> ''
	const path = getRepoPath()!.replace(/^commits\/[^/]+\/?/, '');
	if (!path) {
		return false;
	}

	for (const rootLink of select.all<HTMLAnchorElement>('[aria-label="Browse the repository at this point in the history"]')) {
		// `rootLink.pathname` points to /tree/ but GitHub automatically redirects to /blob/ when the path is of a file
		rootLink.before(
			<a
				href={rootLink.pathname + '/' + path}
				className="btn btn-outline tooltipped tooltipped-sw"
				aria-label="See object at this point in the history"
			>
				{file()}
			</a>
		);

		rootLink.closest<HTMLElement>('.commit-links-cell')!.style.width = 'auto';

		groupSiblings(rootLink);
	}
}

features.add({
	id: __featureName__,
	description: 'Adds links to the file itself in a file’s commit list.',
	screenshot: 'https://user-images.githubusercontent.com/22439276/57195061-b88ddf00-6f6b-11e9-8ad9-13225d09266d.png',
	include: [
		features.isCommitList
	],
	load: features.onAjaxedPages,
	init
});
