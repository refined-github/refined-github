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

		// TODO: drop `as` after https://github.com/Microsoft/TSJS-lib-generator/pull/697
		(rootLink.closest('.commit-links-cell') as HTMLElement).style.width = 'auto';

		groupSiblings(rootLink);
	}
}

features.add({
	id: 'link-to-file-in-file-history',
	description: 'Link to current file when viewing the history of a file',
	include: [
		features.isCommitList
	],
	load: features.onAjaxedPages,
	init
});
