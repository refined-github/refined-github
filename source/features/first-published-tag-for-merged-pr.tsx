import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import {TagIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import features from '.';
import fetchDom from '../helpers/fetch-dom';
import onPrMerge from '../github-events/on-pr-merge';
import createBanner from '../github-helpers/banner';
import TimelineItem from '../github-helpers/timeline-item';
import attachElement from '../helpers/attach-element';
import {canEditEveryComment} from './quick-comment-edit';
import {buildRepoURL, getRepo} from '../github-helpers';
import onConversationHeaderUpdate from '../github-events/on-conversation-header-update';

// TODO: Not an exact match; Moderators can edit comments but not create releases
const canCreateRelease = canEditEveryComment;

function getTimelineEvent(tagUrl: string, tagName: string): JSX.Element {
	return (
		<TimelineItem>
			{createBanner({
				text: <>The PR first appeared in <span className="text-mono text-small">{tagName}</span></>,
				url: tagUrl,
				buttonLabel: <><TagIcon/> See release</>,
			})}
		</TimelineItem>
	);
}

const getFirstTag = cache.function(async (commit: string): Promise<string | undefined> => {
	const firstTag = await fetchDom(
		buildRepoURL('branch_commits', commit),
		'ul.branches-tag-list li:last-child a',
	);

	return firstTag?.textContent ?? undefined;
}, {
	cacheKey: ([commit]) => `first-tag:${getRepo()!.nameWithOwner}:${commit}`,
});

async function init(): Promise<void> {
	const mergeCommit = select(`.TimelineItem.js-details-container.Details a[href^="/${getRepo()!.nameWithOwner}/commit/" i] > code`)!.textContent!;
	const tagName = await getFirstTag(mergeCommit);

	if (tagName) {
		addExistingTagLink(tagName);
	} else if (canCreateRelease()) {
		addLinkToCreateRelease('This PR doesn’t appear to have been released yet');
	}
}

function addExistingTagLink(tagName: string): void {
	const tagUrl = buildRepoURL('releases/tag', tagName);

	// Select the PR header and sticky header
	for (const discussionHeader of select.all('#partial-discussion-header relative-time:not(.rgh-first-tag)')) {
		discussionHeader.classList.add('rgh-first-tag');

		discussionHeader.parentElement!.append(
			<span>
				<TagIcon className="ml-2 mr-1 color-text-secondary color-fg-muted"/>
				<a
					href={tagUrl}
					className="commit-ref"
					title={`${tagName} was the first Git tag to include this PR`}
				>
					{tagName}
				</a>
			</span>,
		);
	}

	attachElement({
		anchor: '#issue-comment-box',
		position: 'before',
		getNewElement: () => getTimelineEvent(tagUrl, tagName),
	});
}

function addLinkToCreateRelease(text = 'Now you can release this change'): void {
	attachElement({
		anchor: '#issue-comment-box',
		position: 'before',
		getNewElement: () => (
			<TimelineItem>
				<div className="flash">
					{text}
					<a href={buildRepoURL('releases/new')} className="btn btn-sm flash-action">
						<TagIcon/> Draft a new release
					</a>
				</div>
			</TimelineItem>
		),
	});
}

void features.add(import.meta.url, {
	asLongAs: [
		pageDetect.isPRConversation,
		pageDetect.isMergedPR,
	],
	additionalListeners: [
		onConversationHeaderUpdate,
	],
	deduplicate: 'has-rgh-inner',
	init,
}, {
	asLongAs: [
		pageDetect.isPRConversation,
		pageDetect.isOpenPR,
		canCreateRelease,
	],
	additionalListeners: [
		onPrMerge,
	],
	onlyAdditionalListeners: true,
	init() {
		addLinkToCreateRelease();
	},
});

/*

# Test URLs

- PR: https://github.com/refined-github/refined-github/pull/5600
- Locked PR: https://github.com/eslint/eslint/pull/17
- Archived repo: https://github.com/fregante/iphone-inline-video/pull/130

*/
