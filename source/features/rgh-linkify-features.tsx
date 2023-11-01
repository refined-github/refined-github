import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';

import {wrap} from '../helpers/dom-utils.js';
import features from '../feature-manager.js';
import featureLink from '../helpers/feature-link.js';
import {getNewFeatureName} from '../options-storage.js';
import {isAnyRefinedGitHubRepo} from '../github-helpers/index.js';
import observe from '../helpers/selector-observer.js';

function linkifyFeature(possibleFeature: HTMLElement): void {
	const id = getNewFeatureName(possibleFeature.textContent);
	if (!id) {
		return;
	}

	const href = featureLink(id);

	const possibleLink = possibleFeature.firstElementChild ?? possibleFeature;
	if (possibleLink instanceof HTMLAnchorElement) {
		// Possible DOM structure:
		// - <a>
		// - <code> > <a>
		possibleLink.href = href;
		possibleLink.classList.add('color-fg-accent');
	} else if (!possibleFeature.closest('a')) {
		// Possible DOM structure:
		// - <code>
		wrap(
			possibleFeature,
			<a
				className="color-fg-accent"
				data-turbo-frame="repo-content-turbo-frame"
				href={href}
			/>,
		);
	}
}

function init(signal: AbortSignal): void {
	observe([
		'.js-issue-title code', // `isPR`, `isIssue`
		'.js-comment-body code', // `hasComments`
		'.markdown-body code', // `isReleasesOrTags`
		'.markdown-title:not(li) code', // `isSingleCommit`, `isRepoTree`, not on the issue autocomplete
		'code .markdown-title', // `isCommitList`, `isRepoTree`
	], linkifyFeature, {signal});
}

void features.add(import.meta.url, {
	asLongAs: [
		isAnyRefinedGitHubRepo,
	],
	include: [
		pageDetect.hasComments,
		pageDetect.isReleasesOrTags,
		pageDetect.isSingleReleaseOrTag,
		pageDetect.isCommitList,
		pageDetect.isSingleCommit,
		pageDetect.isRepoWiki,
		pageDetect.isPR,
		pageDetect.isIssue,
	],
	init,
});

/*

Test URLs

- isReleasesOrTags: https://github.com/refined-github/refined-github/releases
- isSingleCommit: https://github.com/refined-github/refined-github/releases/tag/23.7.25
- isIssue: https://github.com/refined-github/refined-github/issues
- isPR: https://github.com/refined-github/refined-github/pull

*/
