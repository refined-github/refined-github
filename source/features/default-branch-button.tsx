/** @jsx h */
import {h} from 'preact';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import {ChevronLeftIcon} from '@primer/octicons-react';

import render from '../helpers/render';

import features from '.';
import GitHubURL from '../github-helpers/github-url';
import {groupButtons} from '../github-helpers/group-buttons';
import getDefaultBranch from '../github-helpers/get-default-branch';
import {getCurrentBranch} from '../github-helpers';

async function init(): Promise<false | void> {
	const branchSelector = await elementReady<HTMLElement>('[data-hotkey="w"]');
	// The branch selector is missing from History pages of files and folders (it only appears on the root)
	if (!branchSelector) {
		return false;
	}

	const defaultBranch = await getDefaultBranch();
	const currentBranch = getCurrentBranch()!;

	// Don't show the button if we’re already on the default branch
	if (defaultBranch === currentBranch) {
		return false;
	}

	const url = new GitHubURL(location.href);
	if (pageDetect.isRepoRoot()) {
		// The default branch of the root directory is just /user/repo/
		url.route = '';
		url.branch = '';
	} else {
		url.branch = defaultBranch;
	}

	const defaultLink = (
		<a
			className="btn tooltipped tooltipped-ne"
			href={String(url)}
			aria-label="See this view on the default branch"
		>
			<ChevronLeftIcon/>
		</a>
	);

	if (branchSelector.classList.contains('btn-sm')) {
		// Pre "Repository refresh" layout
		defaultLink.classList.add('btn-sm');
	}

	branchSelector.parentElement!.before(defaultLink);
	groupButtons([defaultLink, branchSelector.parentElement!]).classList.add('d-flex');
	branchSelector.style.float = 'none'; // Pre "Repository refresh" layout
}

void features.add(__filebasename, {
	include: [
		pageDetect.isRepoTree,
		pageDetect.isSingleFile,
		pageDetect.isRepoCommitList
	],
	exclude: [
		pageDetect.isRepoHome
	],
	awaitDomReady: false,
	init
});
