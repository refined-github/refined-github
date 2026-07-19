import {mount, type ComponentProps} from 'svelte';
import React from 'dom-chef';
import {$, $$optional} from 'select-dom';
import {CachedFunction} from 'webext-storage-cache';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import waitForPrMerge from '../github-events/on-pr-merge.js';
import {userHasPushAccess} from '../github-helpers/get-user-permission.js';
import {buildRepoUrl, getRepo} from '../github-helpers/index.js';
import {commentBoxHashPr} from '../github-helpers/selectors.js';
import fetchDom from '../helpers/fetch-dom.js';
import observe from '../helpers/selector-observer.js';
import ClosingRemarksController from './closing-remarks-controller.svelte';
import HeaderTag from '../components/closing-remarks-header-tag.svelte';

function excludeNightliesAndJunk({textContent}: HTMLAnchorElement): boolean {
	// https://github.com/refined-github/refined-github/issues/7206
	return !textContent.includes('nightly') && /\d[.]\d/.test(textContent);
}

const firstTag = new CachedFunction('first-tag', {
	async updater(commit: string): Promise<string | false> {
		const tagsAndBranches = await fetchDom(buildRepoUrl('branch_commits', commit));
		const tags = $$optional('ul.branches-tag-list a', tagsAndBranches);
		// eslint-disable-next-line unicorn/no-array-callback-reference -- Just this once, I swear
		return tags.findLast(excludeNightliesAndJunk)?.textContent ?? false;
	},
	cacheKey: ([commit]) => [getRepo()!.nameWithOwner, commit].join(':'),
});

function getMergeCommitHash(): string {
	const mergeCommit = $(`.TimelineItem.js-details-container.Details a[href^="/${getRepo()!.nameWithOwner}/commit/" i]`);
	return /commit\/(?<hash>[0-9a-f]{40})/.exec(mergeCommit.pathname)!.groups!.hash;
}

function mountController(props: ComponentProps<typeof ClosingRemarksController>, signal: AbortSignal): void {
	const container = <div />;
	mount(ClosingRemarksController, {target: container, props});
	observe(commentBoxHashPr, anchor => {
		anchor.before(container);
	}, {signal});
}

async function init(signal: AbortSignal): Promise<void> {
	const hash = getMergeCommitHash();
	const tagName = await firstTag.get(hash);

	if (tagName) {
		const tagUrl = buildRepoUrl('releases/tag', tagName);
		mountController({tagName, tagUrl, postMerge: false}, signal);
		observe('[class*="PullRequestHeaderSummary"] relative-time', relativeTime => {
			mount(HeaderTag, {target: relativeTime.parentElement!, props: {tagName, tagUrl}});
		}, {signal});
		return;
	}

	mountController({postMerge: false}, signal);
}

void features.add(import.meta.url, {
	asLongAs: [
		pageDetect.isPRConversation,
		pageDetect.isMergedPR,
	],
	awaitDomReady: true,
	init,
}, {
	asLongAs: [
		pageDetect.isPRConversation,
		pageDetect.isOpenConversation,
		userHasPushAccess,
	],
	awaitDomReady: true,
	async init(signal: AbortSignal): Promise<void> {
		await waitForPrMerge(signal);
		mountController({postMerge: true}, signal);
	},
});

/*
Test URLs

- PR: https://github.com/refined-github/refined-github/pull/5600
- Locked PR: https://github.com/eslint/eslint/pull/17
- Archived repo: https://github.com/fregante/iphone-inline-video/pull/130
- Junk tag: https://github.com/refined-github/sandbox/pull/1
	- See: https://github.com/refined-github/sandbox/branch_commits/f743c334f6475021ef133591b587bc282c0cf4c4
- Normal tag: https://togithub.com/refined-github/refined-github/pull/7127
	- See https://github.com/refined-github/refined-github/branch_commits/5321825
- Nightly tag: https://togithub.com/neovim/neovim/pull/22060
	- see: https://github.com/neovim/neovim/branch_commits/27b81af

*/
