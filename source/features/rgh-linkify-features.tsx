import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import {wrap} from '../helpers/dom-utils';
import features from '.';
import featureLink from '../helpers/feature-link';
import {featureList} from '../../readme.md';
import {getNewFeatureName} from '../options-storage';
import {isRefinedGitHubRepo} from '../github-helpers';
import onConversationHeaderUpdate from '../github-events/on-conversation-header-update';

function linkifyFeature(possibleFeature: HTMLElement): void {
	const id = getNewFeatureName(possibleFeature.textContent!) as FeatureID;
	if (featureList.includes(id)) {
		const href = featureLink(id);

		const possibleLink = possibleFeature.firstElementChild ?? possibleFeature;
		if (possibleLink instanceof HTMLAnchorElement) {
			possibleLink.href = href;
			possibleLink.classList.add('color-fg-accent');
		} else if (!possibleFeature.closest('a')) {
			const link = <a className="color-fg-accent" href={href}/>;

			if (pageDetect.isSingleCommit()) {
				link.dataset.pjax = '#repo-content-pjax-container';
			}

			wrap(possibleFeature, link);
		}
	}
}

function initTitle(): void {
	for (const possibleFeature of select.all('.js-issue-title code')) {
		linkifyFeature(possibleFeature);
	}
}

function init(): void {
	// `.js-comment-body code': `hasComments`
	// `.markdown-body code: `isReleasesOrTags`
	// `.markdown-title code`: `isSingleCommit`, `isRepoTree`
	// `code .markdown-title`: `isCommitList`, `isRepoTree`
	for (const possibleMention of select.all(':is(.js-comment-body, .markdown-body, .markdown-title) code, code .markdown-title')) {
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
