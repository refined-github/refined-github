import './default-branch-button.css';
import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import {ChevronLeftIcon} from '@primer/octicons-react';

import features from '../feature-manager.js';
import GitHubURL from '../github-helpers/github-url.js';
import {groupButtons} from '../github-helpers/group-buttons.js';
import getDefaultBranch from '../github-helpers/get-default-branch.js';
import observe from '../helpers/selector-observer.js';
import {branchSelector} from '../github-helpers/selectors.js';
import isDefaultBranch from '../github-helpers/is-default-branch.js';
import {isUrlReachable, isRepoCommitListRoot} from '../github-helpers/index.js';

async function add(branchSelector: HTMLElement): Promise<void> {
	// Don't show the button if we’re already on the default branch
	// TODO: Move to `asLongAs` when it accepts async detections
	if (await isDefaultBranch()) {
		return;
	}

	const url = new GitHubURL(location.href);
	if (pageDetect.isRepoRoot()) {
		// The default branch of the root directory is just /user/repo/
		url.route = '';
		url.branch = '';
	} else {
		url.branch = await getDefaultBranch();
	}

	const defaultLink = (
		<a
			className="btn tooltipped tooltipped-se px-2"
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

	// Only request it later to avoid slowing down the page load
	if (await isUrlReachable(url.href)) {
		defaultLink.classList.add('disabled');
		defaultLink.setAttribute('aria-label', 'Object not found on the default branch');
	}
}

function init(signal: AbortSignal): void {
	observe(branchSelector, add, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoTree,
		pageDetect.isSingleFile,
		isRepoCommitListRoot,
	],
	exclude: [
		pageDetect.isRepoHome,
	],
	init,
});
