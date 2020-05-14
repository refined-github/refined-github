import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import TagIcon from 'octicon/tag.svg';
import * as pageDetect from 'github-url-detection';

import features from '../libs/features';
import fetchDom from '../libs/fetch-dom';
import {getRepoURL} from '../libs/utils';
import observeElement from '../libs/simplified-element-observer';

const getFirstTag = cache.function(async (commit: string): Promise<[string, string] | undefined> => {
	const firstTag = await fetchDom<HTMLAnchorElement>(`/${getRepoURL()}/branch_commits/${commit}`, 'ul.branches-tag-list li:last-child a');
	if (!firstTag) {
		return;
	}

	return [firstTag.href, firstTag.textContent!];
}, {
	cacheKey: ([commit]) => `first-tag:${getRepoURL()}:${commit}`
});

async function addTag(discussionHeader: HTMLElement): Promise<void | false> {
	const mergeCommit = select('div.TimelineItem-body > a[href*="commit"] > code.link-gray-dark')!.textContent!;
	const [tagUrl, tagName] = await getFirstTag(mergeCommit) ?? [];

	if (!tagUrl) {
		return;
	}

	discussionHeader.parentElement!.append(
		<span>
			• <TagIcon className="mx-1 text-gray-light v-align-middle"/>
			<a
				href={tagUrl}
				className="commit-ref"
				title={`${tagName!} was the first tag to include this PR`}
			>
				{tagName}
			</a>
		</span>
	);
}

function init(): void | false {
	// The state will be purple on a merged PR
	if (!select.exists('.State.State--purple')) {
		return false;
	}

	const ajaxedTitleArea = select('#partial-discussion-header')!.parentElement!;
	observeElement(ajaxedTitleArea, () => {
		// Select the PR header and sticky header
		for (const discussionHeader of select.all('#partial-discussion-header relative-time:not(.rgh-first-tag)')) {
			discussionHeader.classList.add('rgh-first-tag');
			addTag(discussionHeader);
		}
	});
}

features.add({
	id: __filebasename,
	description: 'Shows the first tag a merged PR was published on.',
	screenshot: 'https://user-images.githubusercontent.com/16872793/81943321-38ac4300-95c9-11ea-8543-0f4858174e1e.png'
}, {
	include: [
		pageDetect.isPRConversation
	],
	init
});
