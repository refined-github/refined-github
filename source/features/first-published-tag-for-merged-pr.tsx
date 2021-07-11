import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import {TagIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import features from '.';
import fetchDom from '../helpers/fetch-dom';
import {buildRepoURL, getRepo} from '../github-helpers';
import onConversationHeaderUpdate from '../github-events/on-conversation-header-update';

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

	// Select the PR header and sticky header
	for (const discussionHeader of select.all('#partial-discussion-header relative-time:not(.rgh-first-tag)')) {
		discussionHeader.classList.add('rgh-first-tag');

		discussionHeader.parentElement!.append(
			' • ',
			<TagIcon className="mx-1 text-gray-light color-text-tertiary v-align-middle"/>,
			<a
				href={buildRepoURL('releases/tag', tagName)}
				className="commit-ref"
				title={`${tagName} was the first Git tag to include this PR`}
			>
				{tagName}
			</a>,
		);
	}
}

void features.add(__filebasename, {
	include: [
		() => pageDetect.isPRConversation() && pageDetect.isMergedPR(),
	],
	additionalListeners: [
		onConversationHeaderUpdate,
	],
	init,
});
