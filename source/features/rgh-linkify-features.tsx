import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import {wrap} from '../helpers/dom-utils';
import features from '.';
import featureLink from '../helpers/feature-link';
import {getNewFeatureName} from '../options-storage';
import {isRefinedGitHubRepo} from '../github-helpers';
import onConversationHeaderUpdate from '../github-events/on-conversation-header-update';

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

function initTitle(): void {
	for (const possibleFeature of select.all('.js-issue-title code')) {
		linkifyFeature(possibleFeature);
	}
}

function init(): void {
	for (const possibleMention of select.all([
		'.js-comment-body code', // `hasComments`
		'.markdown-body code', // `isReleasesOrTags`
		'.markdown-title code', // `isSingleCommit`, `isRepoTree`
		'code .markdown-title', // `isCommitList`, `isRepoTree`
	].join(','))) {
		linkifyFeature(possibleMention);
	}
}

void features.add(import.meta.url, {
	asLongAs: [
		isRefinedGitHubRepo,
	],
	include: [
		pageDetect.hasComments,
		pageDetect.isReleasesOrTags,
		pageDetect.isCommitList,
		pageDetect.isSingleCommit,
		pageDetect.isRepoTree,
	],
	deduplicate: 'has-rgh-inner',
	init,
}, {
	asLongAs: [
		isRefinedGitHubRepo,
	],
	include: [
		pageDetect.isPR,
		pageDetect.isIssue,
	],
	additionalListeners: [
		onConversationHeaderUpdate,
	],
	deduplicate: 'has-rgh-inner',
	init: initTitle,
});
