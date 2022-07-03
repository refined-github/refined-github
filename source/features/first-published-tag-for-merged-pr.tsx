import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import {TagIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import features from '.';
import fetchDom from '../helpers/fetch-dom';
import {buildRepoURL, getRepo} from '../github-helpers';
import onConversationHeaderUpdate from '../github-events/on-conversation-header-update';
import attachElement from '../helpers/attach-element';
import TimelineItem from '../github-helpers/timeline-item';

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

	if (!tagName) {
		return;
	}

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
		getNewElement: () => (
			<TimelineItem>
				<div className="flash flash-success">
					The PR first appeared in <span className="text-mono text-small">{tagName}</span>
					<a href={tagUrl} className="btn btn-sm flash-action">
						<TagIcon/> See release
					</a>
				</div>
			</TimelineItem>
		),
	});
}

void features.add(import.meta.url, {
	include: [
		() => pageDetect.isPRConversation() && pageDetect.isMergedPR(),
	],
	additionalListeners: [
		onConversationHeaderUpdate,
	],
	deduplicate: 'has-rgh-inner',
	init,
});

/*

# Test URLs

- PR: https://github.com/refined-github/refined-github/pull/5600
- Locked PR: https://github.com/eslint/eslint/pull/17
- Archived repo: https://github.com/fregante/iphone-inline-video/pull/130

*/
