import './default-branch-button.css';
import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import ChevronLeftIcon from 'octicons-plain-react/ChevronLeft';
import {elementExists} from 'select-dom';
import memoize from 'memoize';

import features from '../feature-manager.js';
import GitHubFileURL from '../github-helpers/github-file-url.js';
import {groupButtons} from '../github-helpers/group-buttons.js';
import getDefaultBranch from '../github-helpers/get-default-branch.js';
import observe from '../helpers/selector-observer.js';
import {branchSelector} from '../github-helpers/selectors.js';
import isDefaultBranch from '../github-helpers/is-default-branch.js';
import {fixFileHeaderOverlap, isRepoCommitListRoot} from '../github-helpers/index.js';

async function updateUrl(event: React.MouseEvent<HTMLAnchorElement>): Promise<void> {
	event.currentTarget.href = await getUrl(location.href);
}

const getUrl = memoize(async (currentUrl: string): Promise<string> => {
	const defaultUrl = new GitHubFileURL(currentUrl);
	if (pageDetect.isRepoRoot()) {
		// The default branch of the root directory is just /user/repo/
		defaultUrl.route = '';
		defaultUrl.branch = '';
	} else {
		defaultUrl.branch = await getDefaultBranch();
	}

	return defaultUrl.href;
});

async function add(branchSelector: HTMLElement): Promise<void> {
	// React issues. Duplicates appear after a color scheme update
	// https://github.com/refined-github/refined-github/issues/7098
	if (elementExists('.rgh-default-branch-button')) {
		return;
	}

	if (pageDetect.isSingleFile()) {
		fixFileHeaderOverlap(branchSelector);
	}

	const defaultLink = (
		<a
			className="btn tooltipped tooltipped-se px-2 rgh-default-branch-button"
			href={await getUrl(location.href)}
			aria-label="See this view on the default branch"
			// Update on hover because the URL may change without a DOM refresh
			// https://github.com/refined-github/refined-github/issues/6554
			// Inlined listener because `mouseenter` is too heavy for `delegate`
			onMouseEnter={updateUrl}
			// Don't enable AJAX on this behavior because we need a full page reload to drop the button, same reason as above #6554
			// data-turbo-frame="repo-content-turbo-frame"
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
	observe(branchSelector, add, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoTree,
		pageDetect.isSingleFile,
		isRepoCommitListRoot,
	],
	exclude: [
		isDefaultBranch,
	],
	init,
});

/*

Test URLs:

- isRepoTree https://github.com/refined-github/refined-github/tree/07ecc75
- isSingleFile, 410 Gone from default branch https://github.com/refined-github/refined-github/blob/07ecc75/extension/content.js
- isRepoCommitList: https://github.com/refined-github/refined-github/commits/07ecc75/
- isRepoCommitList (already on default branch): https://github.com/typed-ember/ember-cli-typescript/commits/master
- isRepoCommitListRoot (no branch selector): https://github.com/refined-github/refined-github/commits/07ecc75/extension

*/
