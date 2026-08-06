import React from 'dom-chef';
import {$} from 'select-dom';
import batchedFunction from 'batched-function';

import * as pageDetect from 'github-url-detection';
import TagIcon from 'octicons-plain-react/Tag';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import {buildRepoUrl} from '../github-helpers/index.js';
import observe from '../helpers/selector-observer.js';
import joinJsx from '../helpers/join-jsx.js';
import {getCommitHash} from './mark-merge-commits-in-list.js';
import GetTagsOnCommit from './tags-on-commits-list.gql';
import {commitTitleInLists} from '../github-helpers/selectors.js';

type CommitTags = Record<string, Set<string>>;

async function getTags(lastCommit: string, after?: string, tags: CommitTags = {}): Promise<CommitTags> {
	const {repository} = await api.v4(GetTagsOnCommit, {
		variables: {
			commit: lastCommit,
			...after && {after},
		},
	});
	const {nodes} = repository.refs;

	for (const node of nodes) {
		const commit = node.target.commitResourcePath.split('/', 5)[4];
		if (node.name !== 'nightly') {
			tags[commit] ??= new Set();
			tags[commit].add(node.name);
		}
	}

	if (nodes.length === 0 || !repository.refs.pageInfo.hasNextPage) {
		return tags;
	}

	const lastTag = nodes.at(-1)!.target;
	const lastCommitDate = new Date(repository.object.committedDate);
	const lastTagDate = new Date('tagger' in lastTag ? lastTag.tagger.date : lastTag.committedDate);

	// If the last tag is newer than last commit on the page, then not all commits are accounted for, keep looking
	if (lastCommitDate >= lastTagDate) {
		return tags;
	}

	// eslint-disable-next-line unicorn/no-useless-recursion -- Not much better
	return getTags(lastCommit, repository.refs.pageInfo.endCursor, tags);
}

function renderTags(commit: HTMLElement, tags: Set<string>): void {
	const tagLinks = [...tags].map(tag =>
		<a
			className="text-bold Link--primary no-underline"
			href={buildRepoUrl('releases/tag', tag)}
		>
			{tag}
		</a>,
	);

	$([
		'div[data-testid="list-view-item-description"]',
		'[class^="Description-module__container"]',
	], commit).append(
		<div className="ml-1 tmp-ml-1 d-flex flex-items-center gap-1">
			<TagIcon className="mr-1 tmp-mr-1 color-fg-muted" />
			<span className="d-flex flex-wrap gap-1">
				{joinJsx(', ', tagLinks)}
			</span>
		</div>,
	);

	$(commitTitleInLists, commit).prepend(<TagIcon className="mr-2 tmp-mr-2" />);
	commit.classList.add('rgh-tagged');
}

async function markTags(commits: HTMLElement[]): Promise<void> {
	const tags = await getTags(getCommitHash(commits.at(-1)!));

	for (const commit of commits) {
		const commitTags = tags[getCommitHash(commit)];
		// `commitTags` can be undefined if a commit has no associated release tags in the GraphQL response
		if (commitTags?.size) {
			renderTags(commit, commitTags);
		}
	}
}

async function init(signal: AbortSignal): Promise<void> {
	observe(
		'[data-testid="commit-row-item"]',
		batchedFunction(markTags, {delay: 100}),
		{signal},
	);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoCommitList,
	],
	requiresToken: true,
	init,
});

/*

Test URLs:

https://github.com/refined-github/refined-github/commits/19.5.21.1921

*/
