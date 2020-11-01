import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import TagIcon from 'octicon/tag.svg';
import * as pageDetect from 'github-url-detection';

import features from '.';
import fetchDom from '../helpers/fetch-dom';
import observeElement from '../helpers/simplified-element-observer';
import {buildRepoURL, getRepositoryInfo} from '../github-helpers';

const getFirstTag = cache.function(async (commit: string): Promise<string | undefined> => {
	const firstTag = await fetchDom<HTMLAnchorElement>(
		buildRepoURL(`branch_commits/${commit}`),
		'ul.branches-tag-list li:last-child a'
	);

	return firstTag?.textContent!;
}, {
	cacheKey: ([commit]) => `first-tag:${getRepositoryInfo()!.url}:${commit}`
});

async function init(): Promise<void> {
	const mergeCommit = select(`.TimelineItem.js-details-container.Details a[href^="/${getRepositoryInfo()!.url}/commit/" i] > code.link-gray-dark`)!.textContent!;
	const tagName = await getFirstTag(mergeCommit);

	if (!tagName) {
		return;
	}

	// Select the PR header and sticky header
	for (const discussionHeader of select.all('#partial-discussion-header relative-time:not(.rgh-first-tag)')) {
		discussionHeader.classList.add('rgh-first-tag');

		discussionHeader.parentElement!.append(
			' • ',
			<TagIcon className="mx-1 text-gray-light v-align-middle"/>,
			<a
				href={buildRepoURL('releases/tag', tagName)}
				className="commit-ref"
				title={`${tagName} was the first Git tag to include this PR`}
			>
				{tagName}
			</a>
		);
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.isPRConversation
	],
	exclude: [
		() => !select.exists('#partial-discussion-header [title="Status: Merged"]')
	],
	init() {
		observeElement(select('#partial-discussion-header')!.parentElement!, init);
	}
});
