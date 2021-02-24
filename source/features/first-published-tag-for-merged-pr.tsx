import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import {TagIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import features from '.';
import fetchDom from '../helpers/fetch-dom';
import * as api from '../github-helpers/api';
import observeElement from '../helpers/simplified-element-observer';
import {buildRepoURL, getConversationNumber, getRepo} from '../github-helpers';

const getFirstTag = cache.function(async (commit: string): Promise<string | undefined> => {
	const firstTag = await fetchDom<HTMLAnchorElement>(
		buildRepoURL('branch_commits', commit),
		'ul.branches-tag-list li:last-child a'
	);

	return firstTag?.textContent!;
}, {
	cacheKey: ([commit]) => `first-tag:${getRepo()!.nameWithOwner}:${commit}`
});

const getMergeCommit = cache.function(async (prNumber: string): Promise<string> => {
	const {repository} = await api.v4(`
		repository() {
			pullRequest(number: ${prNumber}) {
				mergeCommit {
					abbreviatedOid
				}
			}
		}
	`);

	return repository.pullRequest.mergeCommit.abbreviatedOid;
}, {
	cacheKey: ([prNumber]) => __filebasename + ':' + getRepo()!.nameWithOwner + ':' + String(prNumber)
});

async function init(): Promise<void> {
	const mergeCommit = await getMergeCommit(getConversationNumber()!);
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
		() => pageDetect.isPR() && pageDetect.isMergedPR()
	],
	awaitDomReady: false,
	init() {
		observeElement(select('#partial-discussion-header')!.parentElement!, init);
	}
});
