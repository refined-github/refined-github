import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import TagIcon from 'octicon/tag.svg';
import * as pageDetect from 'github-url-detection';

import fetchDom from '../libs/fetch-dom';
import features from '../libs/features';
import {getRepoURL} from '../libs/utils';
import observeElement from '../libs/simplified-element-observer';

const getEarliestTag = cache.function(async (commit: string): Promise<[string, string] | undefined> => {
	const firstAssociatedTag = await fetchDom<HTMLAnchorElement>(`/${getRepoURL()}/branch_commits/${commit}`, 'ul.branches-tag-list li:last-child a');
	if (!firstAssociatedTag) {
		return;
	}

	return [firstAssociatedTag.href, firstAssociatedTag.textContent!];
}, {
	cacheKey: ([commit]) => `earliest-tag:${getRepoURL()}:${commit}`
});

async function applyTagToHeaders(discussionHeader: Element): Promise<void | false> {
	const mergeCommit = select('div.TimelineItem-body > a[href*="commit"] > code.link-gray-dark')!.textContent!;
	const [tagUrl, tagName] = await getEarliestTag(mergeCommit) ?? [];

	if (!tagUrl) {
		return;
	}

	discussionHeader.parentElement!.append(
		<span title={`${tagName!} was the earliest tag after this PR was merged`}>
			• <TagIcon width={14} className="mx-1 text-gray-light"/>
			<a href={tagUrl} className="commit-ref">
				{tagName}
			</a>
		</span>
	);
}

function init(): void | false {
	if (!select.exists('.State.State--purple')) {
		return false;
	}

	const ajaxedTitleArea = select('#partial-discussion-header')!.parentElement!;
	observeElement(ajaxedTitleArea, () => {
		for (const discussionHeader of select.all('#partial-discussion-header relative-time:not(.rgh-earliest-tag)')) {
			discussionHeader.classList.add('rgh-earliest-tag');
			applyTagToHeaders(discussionHeader);
		}
	});
}

features.add({
	id: __filebasename,
	description: 'Show the earliest tag after a merged PR.',
	screenshot: 'https://user-images.githubusercontent.com/16872793/81870251-7c5c6980-9543-11ea-836d-abfbce92c74d.png'
}, {
	include: [
		pageDetect.isPRConversation
	],
	init
});
