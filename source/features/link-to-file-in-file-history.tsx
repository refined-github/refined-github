import React from 'dom-chef';
import select from 'select-dom';
import FileIcon from 'octicon/file.svg';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';
import {groupSiblings} from '../libs/group-buttons';

function init(): void | false {
	const breadcrumb = select('.breadcrumb');
	if (!breadcrumb) {
		// Probably looking at the base /commits/<branch> page, not a subfolder or file.
		return false;
	}

	// Extract the file path from the breadcrumb. Aware of branch names that contain slashes
	const path = breadcrumb.textContent!.trim().replace(/^History for [^/]+/, '');

	for (const rootLink of select.all<HTMLAnchorElement>('[aria-label="Browse the repository at this point in the history"]')) {
		// `rootLink.pathname` points to /tree/ but GitHub automatically redirects to /blob/ when the path is of a file
		rootLink.before(
			<a
				href={rootLink.pathname + path}
				className="btn btn-outline tooltipped tooltipped-sw"
				aria-label="See object at this point in the history"
			>
				<FileIcon/>
			</a>
		);

		groupSiblings(rootLink);
	}
}

features.add({
	id: __filebasename,
	description: 'Adds links to the file itself in a file’s commit list.',
	screenshot: 'https://user-images.githubusercontent.com/22439276/57195061-b88ddf00-6f6b-11e9-8ad9-13225d09266d.png'
}, {
	include: [
		pageDetect.isRepoCommitList
	],
	init
});
