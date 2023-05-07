import './default-branch-button.css';
import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import {ChevronLeftIcon} from '@primer/octicons-react';

import features from '../feature-manager.js';
import GitHubURL from '../github-helpers/github-url.js';
import {groupButtons} from '../github-helpers/group-buttons.js';
import getDefaultBranch from '../github-helpers/get-default-branch.js';
import {getCurrentCommittish} from '../github-helpers/index.js';
import observe from '../helpers/selector-observer.js';

async function add(branchSelector: HTMLElement): Promise<void> {
	const defaultBranch = await getDefaultBranch();
	const currentBranch = getCurrentCommittish();

	// Don't show the button if we’re already on the default branch
	if (defaultBranch === currentBranch) {
		return;
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
			className="btn tooltipped tooltipped-s px-2"
			href={url.href}
			data-turbo-frame="repo-content-turbo-frame"
			aria-label="See this view on the default branch"
		>
			<ChevronLeftIcon/>
		</a>
	);

	// The DOM varies between details-based DOM and React-based one
	const selectorWrapper = branchSelector.tagName === 'SUMMARY'
		? branchSelector.parentElement!
		: branchSelector;

	selectorWrapper.before(defaultLink);
	groupButtons([defaultLink, selectorWrapper]).classList.add('d-flex', 'rgh-default-branch-button-group');
}

function init(signal: AbortSignal): void {
	observe('[data-hotkey="w"]', add, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoTree,
		pageDetect.isSingleFile,
		pageDetect.isRepoCommitList,
	],
	exclude: [
		pageDetect.isRepoHome,
	],
	init,
});
