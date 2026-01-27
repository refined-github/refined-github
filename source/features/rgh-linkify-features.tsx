import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';

import {wrap} from '../helpers/dom-utils.js';
import features from '../feature-manager.js';
import {getFeatureUrl} from '../helpers/rgh-links.js';
import {getNewFeatureName} from '../feature-data.js';
import {isAnyRefinedGitHubRepo} from '../github-helpers/index.js';
import observe from '../helpers/selector-observer.js';
import {commitTitleInLists} from '../github-helpers/selectors.js';

function linkifyFeature(possibleFeature: HTMLElement): void {
	const originalText = possibleFeature.textContent;
	const id = getNewFeatureName(originalText);
	if (!id) {
		return;
	}

	const href = getFeatureUrl(id);
	// If the original text is different from the resolved ID, it's an old name
	const isOldName = originalText !== id;
	const title = isOldName ? `Now called ${id}` : undefined;

	const possibleLink = possibleFeature.firstElementChild ?? possibleFeature;
	if (possibleLink instanceof HTMLAnchorElement) {
		// Possible DOM structure:
		// - <a>
		// - <code> > <a>
		possibleLink.href = href;
		possibleLink.classList.add('color-fg-accent');
		if (title) {
			possibleLink.title = title;
		}
	} else if (!possibleFeature.closest('a')) {
		// Possible DOM structure:
		// - <code>
		wrap(
			possibleFeature,
			<a
				className="color-fg-accent"
				data-turbo-frame="repo-content-turbo-frame"
				href={href}
				title={title}
			/>,
		);
	}
}

function init(signal: AbortSignal): void {
	observe([
		'.js-issue-title code', // `isPR`, Old view `isIssue`
		'[data-testid="issue-title"] code', // `isIssue`
		'.js-comment-body code', // Old view `hasComments`
		'.markdown-body code', // `hasComments`, `isReleasesOrTags`
		'[class^="CommitHeader-module__commitMessageContainer"] code', // `isSingleCommit`,
		`${commitTitleInLists} code`, // `isCommitList`,
		'.react-directory-commit-message code', // `isRepoTree`
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
		pageDetect.isRepoTree,
	],
	init,
});

/*

Test URLs

- hasComments: https://github.com/refined-github/refined-github/issues/8867
- isReleasesOrTags: https://github.com/refined-github/refined-github/releases
- isSingleReleaseOrTag: https://github.com/refined-github/refined-github/releases/tag/23.7.25
- isCommitList: https://github.com/refined-github/refined-github/commits/main
- isSingleCommit: https://github.com/refined-github/refined-github/commit/d63e2d97fc4d85f986a120fb49cd8e09f6785b93
- isRepoWiki: https://github.com/refined-github/refined-github/wiki/Extended-feature-descriptions
- isPR: https://github.com/refined-github/refined-github/pull/8904
- isIssue: https://github.com/refined-github/refined-github/issues/8902

*/
