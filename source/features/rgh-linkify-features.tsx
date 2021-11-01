import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import {wrap} from '../helpers/dom-utils';
import features from '.';
import featureLink from '../helpers/feature-link';
import {getNewFeatureName} from '../options-storage';
import {isRefinedGitHubRepo} from '../github-helpers';
import onConversationHeaderUpdate from '../github-events/on-conversation-header-update';

function linkifyFeature(codeElement: HTMLElement): void {
	const id = getNewFeatureName(codeElement.textContent!) as FeatureID;
	if (features.list.includes(id)) {
		const href = featureLink(id);

		const possibleLink = codeElement.firstElementChild ?? codeElement;
		if (possibleLink instanceof HTMLAnchorElement) {
			possibleLink.href = href;
			possibleLink.classList.add('color-fg-accent');
		} else if (!codeElement.closest('a')) {
			const link = <a className="color-fg-accent" href={href}/>;

			if (pageDetect.isSingleCommit()) {
				link.dataset.pjax = '#repo-content-pjax-container';
			}

			wrap(codeElement, link);
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

void features.add(__filebasename, {
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
