import {mount, type ComponentProps} from 'svelte';
import React from 'dom-chef';
import {$, $$optional} from 'select-dom';
import {CachedFunction} from 'webext-storage-cache';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import waitForPrMerge from '../github-events/on-pr-merge.js';
import {userHasPushAccess} from '../github-helpers/get-user-permission.js';
import {buildRepoUrl, getRepo} from '../github-helpers/index.js';
import fetchDom from '../helpers/fetch-dom.js';
import observe from '../helpers/selector-observer.js';
import ClosingRemarks from './closing-remarks.svelte';
import HeaderTag from '../components/closing-remarks-header-tag.svelte';

const firstTag = new CachedFunction('first-tag', {
	async updater(commit: string): Promise<string | false> {
		const tagsAndBranches = await fetchDom(buildRepoUrl('branch_commits', commit));
		const tags = $$optional('ul.branches-tag-list a', tagsAndBranches);
		// Prefer versioned tags https://github.com/refined-github/refined-github/issues/7206
		const tag = tags.findLast(({textContent}) =>
			!textContent.includes('nightly') && /\d[.]\d/.test(textContent),
		)

		// But still select any tag if no versioned tags are found
		// https://github.com/refined-github/refined-github/issues/9831
		?? tags.at(-1);

		// No tags might be found at all
		return tag?.textContent ?? false;
	},
	cacheKey: ([commit]) => [getRepo()!.nameWithOwner, commit].join(':'),
});

function getMergeCommitHash(): string {
	const mergeCommit = $(`.TimelineItem.js-details-container.Details a[href^="/${getRepo()!.nameWithOwner}/commit/" i]`);
	return /commit\/(?<hash>[0-9a-f]{40})/.exec(mergeCommit.pathname)!.groups!.hash;
}

function mountClosingRemarks(props: ComponentProps<typeof ClosingRemarks>, signal: AbortSignal): void {
	const container = <div />;
	mount(ClosingRemarks, {target: container, props});
	observe('.js-discussion', anchor => {
		anchor.after(container);
	}, {signal});
}

async function init(signal: AbortSignal): Promise<void> {
	const mergeCommit = getMergeCommitHash();
	const tagName = await firstTag.get(mergeCommit);
	if (!tagName) {
		mountClosingRemarks({mergeCommit}, signal);
		return;
	}

	mountClosingRemarks({tagName, mergeCommit}, signal);
	observe('[class*="PullRequestHeaderSummary"] relative-time', relativeTime => {
		mount(HeaderTag, {target: relativeTime.parentElement!, props: {tagName}});
	}, {signal});
}

void features.add(import.meta.url, {
	// When arriving on an already-merged PR
	asLongAs: [
		pageDetect.isPRConversation,
		pageDetect.isMergedPR,
	],
	awaitDomReady: true, // It must look for the merge commit
	init,
}, {
	// This catches a PR while it's being merged
	asLongAs: [
		pageDetect.isPRConversation,
		pageDetect.isOpenConversation,
		userHasPushAccess,
	],
	awaitDomReady: true, // Post-load user event, no need to listen earlier
	async init(signal: AbortSignal): Promise<void> {
		await waitForPrMerge(signal);
		mountClosingRemarks({postMerge: true}, signal);
	},
});

/*
Test URLs

- PR: https://github.com/refined-github/refined-github/pull/5600
- Locked PR: https://github.com/eslint/eslint/pull/17
- Archived repo: https://github.com/fregante/iphone-inline-video/pull/130
- Untagged PR: https://github.com/mwmwmwmwmwmwmwmwmwmwmwwwmwmwmwmwmwmwmwm/closing-remarks/pull/3
- Prefer versioned tag: https://github.com/mwmwmwmwmwmwmwmwmwmwmwwwmwmwmwmwmwmwmwm/closing-remarks/pull/1
	- See: https://github.com/mwmwmwmwmwmwmwmwmwmwmwwwmwmwmwmwmwmwmwm/closing-remarks/branch_commits/60eb1e5ee0953c70e6fc6150dbeacd1cf20899be
- Show nightly tag if alone: https://github.com/mwmwmwmwmwmwmwmwmwmwmwwwmwmwmwmwmwmwmwm/closing-remarks/pull/2
	- See https://github.com/mwmwmwmwmwmwmwmwmwmwmwwwmwmwmwmwmwmwmwm/closing-remarks/branch_commits/7571f5312ab5db9c23aa11a7e40c5ec88624a11b

*/
