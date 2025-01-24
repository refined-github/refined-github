import React from 'dom-chef';
import cache from 'webext-storage-cache/legacy.js';
import {$, $$, $$optional} from 'select-dom/strict.js';

import TagIcon from 'octicons-plain-react/Tag';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import {getCommitHash} from './mark-merge-commits-in-list.js';
import {buildRepoURL, getRepo} from '../github-helpers/index.js';
import GetTagsOnCommit from './tags-on-commits-list.gql';
import {expectToken} from '../github-helpers/github-token.js';
import delay from '../helpers/delay.js';

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
			commit: lastCommit,
			...after && {after},
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
		tags[commit] ||= [];

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
	await expectToken();
	const cacheKey = `tags:${getRepo()!.nameWithOwner}`;

	let commitsOnPage = $$optional('[data-testid="commit-row-item"]');
	if (commitsOnPage.length === 0) {
		// Try waiting a bit longer
		// https://github.com/refined-github/refined-github/issues/7954
		await delay(1000);
		commitsOnPage = $$('[data-testid="commit-row-item"]');
	}

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
			// There was no tag for this commit, save that info to the cache
			commitsWithNoTags.push(targetCommit);
		} else if (targetTags.length > 0) {
			const commitMeta = $([
				'div[data-testid="list-view-item-description"]',
				'[class^="Description-module__container"] > [class^="Box-sc"]',
			], commit);

			commitMeta.append(
				<span className="d-flex flex-items-center gap-1">
					<TagIcon className="ml-1" />
					{...targetTags.map(tag => (
						<>
							{' '}
							{/* .markdown-title enables the background color */}
							<a
								className="Link--muted markdown-title"
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
