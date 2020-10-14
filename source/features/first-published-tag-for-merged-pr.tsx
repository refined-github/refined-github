import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import TagIcon from 'octicon/tag.svg';
import * as pageDetect from 'github-url-detection';

import features from '.';
import fetchDom from '../helpers/fetch-dom';
import {getRepoURL} from '../github-helpers';
import observeElement from '../helpers/simplified-element-observer';

const getFirstTag = cache.function(async (commit: string): Promise<string | undefined> => {
	const firstTag = await fetchDom<HTMLAnchorElement>(
		`/${getRepoURL()}/branch_commits/${commit}`,
		'ul.branches-tag-list li:last-child a'
	);

	return firstTag?.textContent!;
}, {
	cacheKey: ([commit]) => `first-tag:${getRepoURL()}:${commit}`
});

async function init(): Promise<void> {
	const mergeCommit = select(`.TimelineItem.js-details-container.Details a[href^="/${getRepoURL()}/commit/" i] > code.link-gray-dark`)!.textContent!;
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
				href={getRepoURL('releases/tag', tagName)}
				className="commit-ref"
				title={`${tagName} was the first Git tag to include this PR`}
			>
				{tagName}
			</a>
		);
	}
}

void features.add({
	id: __filebasename,
	description: 'Shows the first Git tag a merged PR was included in.',
	screenshot: 'https://user-images.githubusercontent.com/16872793/81943321-38ac4300-95c9-11ea-8543-0f4858174e1e.png'
}, {
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
