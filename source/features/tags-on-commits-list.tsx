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

type TagNode = {
	name: string;
	target: {
		commitResourcePath: string;
	} & ({tagger: {date: Date}} | {committedDate: Date});
};

type CommitTags = Record<string, Set<string>>;

function addTag(tags: CommitTags, commit: string, tag: string): void {
	if (tag === 'nightly') {
		return;
	}

	(tags[commit] ??= new Set()).add(tag);
}

async function getTags(lastCommit: string, after?: string): Promise<CommitTags> {
	const {repository} = await api.v4(GetTagsOnCommit, {
		variables: {commit: lastCommit, after},
	});
	const nodes = repository.refs.nodes as TagNode[];
	const tags: CommitTags = {};

	if (nodes.length === 0) {
		return tags;
	}

	for (const node of nodes) {
		addTag(tags, node.target.commitResourcePath.split('/', 5)[4], node.name);
	}

	const lastTag = nodes.at(-1)!.target;
	const isLastTagYounger = new Date(repository.object.committedDate)
		< new Date('tagger' in lastTag ? lastTag.tagger.date : lastTag.committedDate);

	// If the last tag is newer than last commit on the page, then not all commits are accounted for, keep looking
	if (isLastTagYounger && repository.refs.pageInfo.hasNextPage) {
		for (const [commit, tagNames] of Object.entries(await getTags(lastCommit, repository.refs.pageInfo.endCursor))) {
			for (const tag of tagNames) {
				addTag(tags, commit, tag);
			}
		}
	}

	return tags;
}

function renderTags(commit: HTMLElement, tags: Set<string>): void {
	const tagLinks = [...tags].map(tag =>
		// .markdown-title enables the background color
		<a
			className="Link--muted markdown-title"
			href={buildRepoUrl('releases/tag', tag)}
		>
			<code>{tag}</code>
		</a>,
	);

	$([
		'div[data-testid="list-view-item-description"]',
		'[class^="Description-module__container"]',
	], commit).append(
		<div className="ml-1 tmp-ml-1 d-flex flex-items-center gap-1">
			<TagIcon />
			<span className="d-flex flex-wrap gap-1">
				{joinJsx(' ', tagLinks)}
			</span>
		</div>,
	);
	commit.classList.add('rgh-tagged');
}

async function markTags(commits: HTMLElement[]): Promise<void> {
	const tags = await getTags(getCommitHash(commits.at(-1)!));

	for (const commit of commits) {
		const commitTags = tags[getCommitHash(commit)];
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
