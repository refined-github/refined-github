import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import {TagIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import fetchDom from '../helpers/fetch-dom';
import onPrMerge from '../github-events/on-pr-merge';
import createBanner from '../github-helpers/banner';
import TimelineItem from '../github-helpers/timeline-item';
import attachElement from '../helpers/attach-element';
import {canEditEveryComment} from './quick-comment-edit';
import onConversationHeaderUpdate from '../github-events/on-conversation-header-update';
import {buildRepoURL, getRepo, isRefinedGitHubRepo} from '../github-helpers';
import {getReleaseCount} from './releases-tab';

// TODO: Not an exact match; Moderators can edit comments but not create releases
const canCreateRelease = canEditEveryComment;

const getFirstTag = cache.function('first-tag', async (commit: string): Promise<string | undefined> => {
	const firstTag = await fetchDom(
		buildRepoURL('branch_commits', commit),
		'ul.branches-tag-list li:last-child a',
	);

	return firstTag?.textContent ?? undefined;
}, {
	cacheKey: ([commit]) => [getRepo()!.nameWithOwner, commit].join(':'),
});

async function init(): Promise<void> {
	const mergeCommit = select(`.TimelineItem.js-details-container.Details a[href^="/${getRepo()!.nameWithOwner}/commit/" i] > code`)!.textContent!;
	const tagName = await getFirstTag(mergeCommit);

	if (tagName) {
		addExistingTagLink(tagName);
	} else {
		void addReleaseBanner('The merge commit doesn’t appear in any tags');
	}
}

function addExistingTagLink(tagName: string): void {
	const tagUrl = buildRepoURL('releases/tag', tagName);

	// Select the PR header and sticky header
	for (const discussionHeader of select.all('#partial-discussion-header relative-time:not(.rgh-first-tag)')) {
		discussionHeader.classList.add('rgh-first-tag');

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

	attachElement('#issue-comment-box', {
		before: () => (
			<TimelineItem>
				{createBanner({
					text: <>This pull request first appeared in <span className="text-mono text-small">{tagName}</span></>,
					classes: ['flash-success'],
					action: tagUrl,
					buttonLabel: <><TagIcon/> See release</>,
				})}
			</TimelineItem>
		),
	});
}

async function addReleaseBanner(text = 'Now you can release this change'): Promise<void> {
	if (await getReleaseCount() === 0) {
		return;
	}

	const url = canCreateRelease() ? (
		isRefinedGitHubRepo()
			? 'https://github.com/refined-github/refined-github/actions/workflows/release.yml'
			: buildRepoURL('releases/new')
	) : undefined;
	attachElement('#issue-comment-box', {
		before: () => (
			<TimelineItem>
				{createBanner(url ? {
					text,
					action: url,
					buttonLabel: <><TagIcon/> Draft a new release</>,
				} : {text})}
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
	additionalListeners: [
		onConversationHeaderUpdate,
	],
	deduplicate: 'has-rgh-inner',
	awaitDomReady: true, // DOM-based additionalListeners
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
*/
