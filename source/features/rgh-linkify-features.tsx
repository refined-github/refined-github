import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import {wrap} from '../helpers/dom-utils';
import features from '.';
import {getNewFeatureName} from '../options-storage';
import {isNotRefinedGitHubRepo} from '../github-helpers';
import {featureList} from '../../readme.md';
import onConversationHeaderUpdate from '../github-events/on-conversation-header-update';

function linkifyFeature(codeElement: HTMLElement): void {
	const id = getNewFeatureName(codeElement.textContent!) as FeatureID;
	if (featureList.includes(id) && !codeElement.closest('a')) {
		wrap(codeElement, <a href={`/refined-github/refined-github/blob/main/source/features/${id}.tsx`}/>);
	}
}

function initTitle(): void {
	for (const possibleFeature of select.all('.js-issue-title code')) {
		linkifyFeature(possibleFeature);
	}
}

function init(): void {
	for (const possibleMention of select.all('.js-comment-body code, .markdown-body li code')) {
		linkifyFeature(possibleMention);
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.hasComments,
		pageDetect.isReleasesOrTags,
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
