import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import {closestElementOptional} from 'select-dom';
import {mount} from 'svelte';

import features from '../feature-manager.js';
import {isOwnConversation, isRefinedGitHubRepo} from '../github-helpers/index.js';
import {newCommentField} from '../github-helpers/selectors.js';
import observe from '../helpers/selector-observer.js';
import NetiquetteBanner from './netiquette.svelte';

function mountBanner(commentField: HTMLElement): void {
	const reactWrapper = closestElementOptional('[class^="InlineAutocomplete"]', commentField);
	const target = reactWrapper ?? commentField;
	const container = <div className={reactWrapper ? '' : 'm-2'} />;
	target.prepend(container);
	mount(NetiquetteBanner, {target: container});
}

function makeFieldKinder(field: HTMLParagraphElement): void {
	if (field.textContent.trim() === 'Add your comment here...') {
		// Regular issue/PR comment field, or single review comments
		// https://github.com/refined-github/refined-github/pull/6991
		field.textContent = 'Add your comment here, be kind';
	} else if (field.textContent.trim() === 'Leave a comment') {
		// Main review comment field
		// https://github.com/refined-github/refined-github/pull/6991/files
		field.textContent = 'Leave a comment, be kind';
	} else {
		throw new Error(`Unexpected placeholder text: ${field.textContent}`);
	}
}

function makeReactFieldKinder(field: HTMLTextAreaElement): void {
	field.placeholder = 'Add your comment here, be kind';
}

function initKindness(signal: AbortSignal): void {
	observe('p.CommentBox-placeholder', makeFieldKinder, {signal});
	observe(
		[
			'textarea[placeholder="Use Markdown to format your comment"]', // On issues
			'textarea[placeholder="Leave a comment"]', // On single commits
		],
		makeReactFieldKinder,
		{signal},
	);
}

function initBanner(signal: AbortSignal): void {
	observe(newCommentField, mountBanner, {signal});
}

void features.add(import.meta.url, {
	exclude: [
		isRefinedGitHubRepo,
	],
	include: [
		pageDetect.isConversation,
	],
	awaitDomReady: true, // We're specifically looking for the last event
	init: initBanner,
}, {
	include: [
		pageDetect.isDraftPR,
	],
	exclude: [
		isOwnConversation,
	],
	awaitDomReady: true,
	init: initBanner,
}, {
	include: [
		pageDetect.hasComments,
	],
	init: initKindness,
});

/*

Test URLs

- Old issue: https://togithub.com/facebook/react/issues/227
- Old PR: https://togithub.com/facebook/react/pull/209
- Popular issue: https://togithub.com/facebook/react/issues/13991
- Draft PR: https://togithub.com/react/react/pull/19377

*/
