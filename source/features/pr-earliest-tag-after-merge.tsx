import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import oneTime from 'onetime';
import TagIcon from 'octicon/tag.svg';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';

import fetchDom from '../libs/fetch-dom';
import features from '../libs/features';
import {getRepoURL} from '../libs/utils';

const getEarliestTag = cache.function(async (mergeCommit: string): Promise<[string, string] | undefined> => {
	const firstAssociatedTag = await fetchDom<HTMLAnchorElement>(`/${getRepoURL()}/branch_commits/${mergeCommit}`, 'ul.branches-tag-list li:last-child a');
	if (!firstAssociatedTag) {
		return;
	}

	return [firstAssociatedTag.href, firstAssociatedTag.textContent!];
}, {
	cacheKey: ([mergeCommit]) => `earliest-tag:${getRepoURL()}:${mergeCommit}`
});

async function addEarliestTag(discussionHeader: Element) {
	const mergeCommit = select('div.TimelineItem-body > a[href*="commit"] > code.link-gray-dark')!.textContent!;
	const [tagUrl, tagName] = await getEarliestTag(mergeCommit) ?? [];

	if (!href) {
		return;
	}

	discussionHeader.append(
		<span className="tooltipped tooltipped-s" aria-label={`${textContent} was the earliest tag after this PR was merged`}>
			• <TagIcon width={14} className="mx-1 text-gray-light"/>
			<span className="commit-ref css-truncate user-select-contain expandable ">
				<a href={href}>
					{textContent}
				</a>
			</span>
		</span>
	);
}

function init(): void | false {
	if (!select.exists('.State.State--purple')) {
		return false;
	}

	observe('#partial-discussion-header .TableObject-item--primary, #partial-discussion-header > div.js-sticky div.css-truncate-target', {
		add: addEarliestTag
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
	init: oneTime(init)
});
