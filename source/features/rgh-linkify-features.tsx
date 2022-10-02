import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';

import {wrap} from '../helpers/dom-utils';
import features from '../feature-manager';
import featureLink from '../helpers/feature-link';
import {getNewFeatureName} from '../options-storage';
import {isAnyRefinedGitHubRepo} from '../github-helpers';
import observe from '../helpers/selector-observer';

function linkifyFeature(possibleFeature: HTMLElement): void {
	const id = getNewFeatureName(possibleFeature.textContent!);
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
				href={href}
				data-pjax="#repo-content-pjax-container"
			/>,
		);
	}
}

function init(signal: AbortSignal): void {
	observe([
		'.js-issue-title code', // `isPR`, `isIssue`
		'.js-comment-body code', // `hasComments`
		'.markdown-body code', // `isReleasesOrTags`
		'.markdown-title code', // `isSingleCommit`, `isRepoTree`
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
		pageDetect.isCommitList,
		pageDetect.isSingleCommit,
		pageDetect.isRepoWiki,
		pageDetect.isPR,
		pageDetect.isIssue,
	],
	awaitDomReady: false,
	init,
});
