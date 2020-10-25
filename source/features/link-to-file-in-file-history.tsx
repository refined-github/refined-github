import React from 'dom-chef';
import select from 'select-dom';
import FileIcon from 'octicon/file.svg';
import * as pageDetect from 'github-url-detection';

import features from '.';
import GitHubURL from '../github-helpers/github-url';
import {groupSiblings} from '../github-helpers/group-buttons';

function init(): void | false {
	const {filePath} = new GitHubURL(location.href);
	if (!filePath) {
		return false;
	}

	for (const rootLink of select.all<HTMLAnchorElement>('[aria-label="Browse the repository at this point in the history"]')) {
		// `rootLink.pathname` points to /tree/ but GitHub automatically redirects to /blob/ when the path is of a file
		rootLink.before(
			<a
				href={rootLink.pathname + '/' + filePath}
				className="btn btn-outline tooltipped tooltipped-sw"
				aria-label="See object at this point in the history"
			>
				<FileIcon/>
			</a>
		);

		groupSiblings(rootLink);
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.isRepoCommitList
	],
	init
});
