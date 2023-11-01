import React from 'dom-chef';
import cache from 'webext-storage-cache/legacy.js';
import {$, $$} from 'select-dom';
import {TagIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import {getCommitHash} from './mark-merge-commits-in-list.js';
import {buildRepoURL, getRepo} from '../github-helpers/index.js';
import GetTagsOnCommit from './tags-on-commits-list.gql';

type CommitTags = Record<string, string[]>;

const arrayUnion = (x: string[], y: string[]): string[] => [...new Set([...x, ...y])];

type BaseTarget = {
	commitResourcePath: string;
};

type TagTarget = {
	tagger: {
		date: Date;
	};
} & BaseTarget;

type CommitTarget = {
	committedDate: Date;
} & BaseTarget;

type CommonTarget = TagTarget | CommitTarget;
type TagNode = {
	name: string;
	target: CommonTarget;
};

function mergeTags(oldTags: CommitTags, newTags: CommitTags): CommitTags {
	const result: CommitTags = {...oldTags};
	for (const commit of Object.keys(newTags)) {
		result[commit] = result[commit]
			? arrayUnion(result[commit], newTags[commit])
			: newTags[commit];
	}

	return result;
}

function isTagTarget(target: CommonTarget): target is TagTarget {
	return 'tagger' in target;
}

async function getTags(lastCommit: string, after?: string): Promise<CommitTags> {
	const {repository} = await api.v4(GetTagsOnCommit, {
		variables: {
			after: after ?? null,
			commit: lastCommit,
		},
	});
	const nodes = repository.refs.nodes as TagNode[];

	// If there are no tags in the repository
	if (nodes.length === 0) {
		return {};
	}

	let tags: CommitTags = {};
	for (const node of nodes) {
		const commit = node.target.commitResourcePath.split('/')[4];
		if (!tags[commit]) {
			tags[commit] = [];
		}

		tags[commit].push(node.name);
	}

	const lastTag = nodes.at(-1)!.target;
	const lastTagIsYounger = new Date(repository.object.committedDate) < new Date(isTagTarget(lastTag) ? lastTag.tagger.date : lastTag.committedDate);

	// If the last tag is newer than last commit on the page, then not all commits are accounted for, keep looking
	if (lastTagIsYounger && repository.refs.pageInfo.hasNextPage) {
		tags = mergeTags(tags, await getTags(lastCommit, repository.refs.pageInfo.endCursor));
	}

	// There are no tags for this commit
	return tags;
}

async function init(): Promise<void | false> {
	const cacheKey = `tags:${getRepo()!.nameWithOwner}`;

	const commitsOnPage = $$('.js-commits-list-item');
	const lastCommitOnPage = getCommitHash(commitsOnPage.at(-1)!);
	let cached = await cache.get<Record<string, string[]>>(cacheKey) ?? {};
	const commitsWithNoTags = [];
	for (const commit of commitsOnPage) {
		const targetCommit = getCommitHash(commit);
		let targetTags = cached[targetCommit];
		if (!targetTags) {
			// No tags for this commit found in the cache, check in github
			cached = mergeTags(cached, await getTags(lastCommitOnPage)); // eslint-disable-line no-await-in-loop
			targetTags = cached[targetCommit];
		}

		if (!targetTags) {
			// There was no tags for this commit, save that info to the cache
			commitsWithNoTags.push(targetCommit);
		} else if (targetTags.length > 0) {
			const commitMeta = $('.flex-auto .d-flex.mt-1', commit)!;
			commitMeta.classList.add('flex-wrap');
			commitMeta.append(
				<span>
					<TagIcon className="ml-1"/>
					{...targetTags.map(tag => (
						<>
							{' '}
							<a
								className="Link--muted"
								href={buildRepoURL('releases/tag', tag)}
							>
								<code>{tag}</code>
							</a>
						</>
					))}
				</span>,
			);
			commit.classList.add('rgh-tagged');
		}
	}

	if (commitsWithNoTags.length > 0) {
		for (const commit of commitsWithNoTags) {
			cached[commit] = [];
		}
	}

	await cache.set(cacheKey, cached, {days: 1});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoCommitList,
	],
	awaitDomReady: true,
	deduplicate: 'has-rgh-inner',
	init,
});

/*

Test URLs:

https://github.com/refined-github/refined-github/commits/19.5.21.1921

*/
