import React from 'dom-chef';
import {CachedFunction} from 'webext-storage-cache';
import {$} from 'select-dom';
import {TagIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import fetchDom from '../helpers/fetch-dom.js';
import onPrMerge from '../github-events/on-pr-merge.js';
import createBanner from '../github-helpers/banner.js';
import TimelineItem from '../github-helpers/timeline-item.js';
import attachElement from '../helpers/attach-element.js';
import {canEditEveryComment} from './quick-comment-edit.js';
import {buildRepoURL, getRepo, isRefinedGitHubRepo} from '../github-helpers/index.js';
import {getReleases} from './releases-tab.js';
import observe from '../helpers/selector-observer.js';

// TODO: Not an exact match; Moderators can edit comments but not create releases
const canCreateRelease = canEditEveryComment;

const firstTag = new CachedFunction('first-tag', {
	async updater(commit: string): Promise<string | false> {
		const firstTag = await fetchDom(
			buildRepoURL('branch_commits', commit),
			'ul.branches-tag-list li:last-child a',
		);

		return firstTag?.textContent ?? false;
	},
	cacheKey: ([commit]) => [getRepo()!.nameWithOwner, commit].join(':'),
});

function createReleaseUrl(): string | undefined {
	if (!canCreateRelease()) {
		return;
	}

	if (isRefinedGitHubRepo()) {
		return 'https://github.com/refined-github/refined-github/actions/workflows/release.yml';
	}

	return buildRepoURL('releases/new');
}

async function init(signal: AbortSignal): Promise<void> {
	const mergeCommit = $(`.TimelineItem.js-details-container.Details a[href^="/${getRepo()!.nameWithOwner}/commit/" i] > code`)!.textContent;
	const tagName = await firstTag.get(mergeCommit);

	if (tagName) {
		const tagUrl = buildRepoURL('releases/tag', tagName);

		// Add static box at the bottom
		addExistingTagLinkFooter(tagName, tagUrl);

		// PRs have a regular and a sticky header
		observe('#partial-discussion-header relative-time', addExistingTagLinkToHeader.bind(null, tagName, tagUrl), {signal});
	} else {
		void addReleaseBanner('This PR’s merge commit doesn’t appear in any tags');
	}
}

function addExistingTagLinkToHeader(tagName: string, tagUrl: string, discussionHeader: HTMLElement): void {
	// TODO: Use :has selector instead
	discussionHeader.parentElement!.append(
		<span>
			<TagIcon className="ml-2 mr-1 color-fg-muted"/>
			<a
				href={tagUrl}
				className="commit-ref"
				title={`${tagName} was the first Git tag to include this pull request`}
			>
				{tagName}
			</a>
		</span>,
	);
}

function addExistingTagLinkFooter(tagName: string, tagUrl: string): void {
	const linkedTag = <a href={tagUrl} className="Link--primary text-bold">{tagName}</a>;
	attachElement('#issue-comment-box', {
		before: () => (
			<TimelineItem>
				{createBanner({
					icon: <TagIcon className="m-0"/>,
					text: <>This pull request first appeared in {linkedTag}</>,
					classes: ['flash-success', 'rgh-bg-none'],
				})}
			</TimelineItem>
		),
	});
}

async function addReleaseBanner(text = 'Now you can release this change'): Promise<void> {
	const [releases] = await getReleases();
	if (releases === 0) {
		return;
	}

	const url = createReleaseUrl();
	const bannerContent = {
		icon: <TagIcon className="m-0"/>,
		classes: ['rgh-bg-none'],
		text,
	};

	attachElement('#issue-comment-box', {
		before: () => (
			<TimelineItem>
				{createBanner(url ? {
					...bannerContent,
					action: url,
					buttonLabel: 'Draft a new release',
				} : bannerContent)}
			</TimelineItem>
		),
	});
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
		pageDetect.isOpenPR,
		canCreateRelease,
	],
	additionalListeners: [
		onPrMerge,
	],
	onlyAdditionalListeners: true,
	awaitDomReady: true, // DOM-based filters
	init() {
		void addReleaseBanner();
	},
});

/*
Test URLs

- PR: https://github.com/refined-github/refined-github/pull/5600
- Locked PR: https://github.com/eslint/eslint/pull/17
- Archived repo: https://github.com/fregante/iphone-inline-video/pull/130
- RGH tagged PR: https://github.com/refined-github/sandbox/pull/1

*/
