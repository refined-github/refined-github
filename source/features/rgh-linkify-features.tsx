import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import {wrap} from '../helpers/dom-utils';
import features from '.';
import {isNotRefinedGitHubRepo} from '../github-helpers';
import onConversationHeaderUpdate from '../github-events/on-conversation-header-update';

function linkifyFeature(codeElement: HTMLElement): void {
	const id = codeElement.textContent as FeatureID;
	if (features.list.includes(id) && !codeElement.closest('a')) {
		wrap(codeElement, <a href={`/sindresorhus/refined-github/blob/main/source/features/${id}.tsx`}/>);
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
