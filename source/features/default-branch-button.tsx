import React from 'dom-chef';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import ChevronLeftIcon from 'octicon/chevron-left.svg';

import features from '.';
import parseRoute from '../github-helpers/parse-route';
import {groupButtons} from '../github-helpers/group-buttons';
import getDefaultBranch from '../github-helpers/get-default-branch';
import {getCurrentBranch, getRepoURL} from '../github-helpers';

async function init(): Promise<false | void> {
	const defaultBranch = await getDefaultBranch();
	const currentBranch = getCurrentBranch();

	// Don't show the button if we’re already on the default branch
	if (defaultBranch === currentBranch) {
		return false;
	}

	const path = parseRoute(location.pathname);
	// The branch selector will be on `isRepoCommitList()` **unless** you're in a folder/file
	if (pageDetect.isRepoCommitList() && path.filePath.length > 0) {
		return false;
	}

	let url;
	if (pageDetect.isRepoRoot()) {
		url = `/${getRepoURL()}`;
	} else {
		path.branch = defaultBranch;
		url = path.toString();
	}

	const branchSelector = (await elementReady('#branch-select-menu'))!;
	const defaultLink = (
		<a
			className="btn btn-sm tooltipped tooltipped-ne"
			href={url}
			aria-label="See this view on the default branch"
		>
			<ChevronLeftIcon/>
		</a>
	);

	branchSelector.before(defaultLink);

	const group = groupButtons([defaultLink, branchSelector]);
	group.classList.add('m-0');
	group.parentElement!.classList.add('flex-shrink-0');
}

features.add({
	id: __filebasename,
	description: 'Adds link the default branch on directory listings and files.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/71886648-2891dc00-316f-11ea-98d8-c5bf6c24d85c.png'
}, {
	include: [
		pageDetect.isRepoTree,
		pageDetect.isSingleFile,
		pageDetect.isRepoCommitList
	],
	waitForDomReady: false,
	init
});
