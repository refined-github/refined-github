import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import {wrap} from '../helpers/dom-utils';
import features from '.';
import {getNewFeatureName} from '../options-storage';
import {isNotRefinedGitHubRepo} from '../github-helpers';
import onConversationHeaderUpdate from '../github-events/on-conversation-header-update';

function linkifyFeature(codeElement: HTMLElement): void {
	const id = getNewFeatureName(codeElement.textContent!) as FeatureID;
	if (features.list.includes(id)) {
		const href = `/refined-github/refined-github/blob/main/source/features/${id}.tsx`;

		const possibleLink = codeElement.firstElementChild ?? codeElement;
		if (possibleLink instanceof HTMLAnchorElement) {
			possibleLink.href = href;
			possibleLink.classList.add('color-fg-accent');
		} else if (!codeElement.closest('a')) {
			wrap(codeElement, <a className="color-fg-accent" href={href}/>);
		}
	}
}

function initTitle(): void {
	for (const possibleFeature of select.all('.js-issue-title code')) {
		linkifyFeature(possibleFeature);
	}
}

function init(): void {
	for (const possibleMention of select.all(':is(.js-comment-body, .markdown-body li, .markdown-title) code, code .markdown-title')) {
		linkifyFeature(possibleMention);
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.hasComments,
		pageDetect.isReleasesOrTags,
		pageDetect.isCommitList,
		pageDetect.isSingleCommit,
		pageDetect.isRepoTree,
	],
	exclude: [
		isNotRefinedGitHubRepo,
	],
	deduplicate: 'has-rgh-inner',
	init,
}, {
	include: [
		pageDetect.isPR,
		pageDetect.isIssue,
	],
	exclude: [
		isNotRefinedGitHubRepo,
	],
	additionalListeners: [
		onConversationHeaderUpdate,
	],
	deduplicate: 'has-rgh-inner',
	init: initTitle,
});
