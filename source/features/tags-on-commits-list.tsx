import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import {TagIcon} from '@primer/octicons-react';
import arrayUnion from 'array-union';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';
import {getCommitHash} from './mark-merge-commits-in-list';
import {buildRepoURL, getRepo} from '../github-helpers';

type CommitTags = Record<string, string[]>;

interface BaseTarget {
	commitResourcePath: string;
}

type TagTarget = {
	tagger: {
		date: Date;
	};
} & BaseTarget;

type CommitTarget = {
	committedDate: Date;
} & BaseTarget;

type CommonTarget = TagTarget | CommitTarget;
interface TagNode {
	name: string;
	target: CommonTarget;
}

function mergeTags(oldTags: CommitTags, newTags: CommitTags): CommitTags {
	const result: CommitTags = {...oldTags};
	for (const commit in newTags) {
		if (result[commit]) {
			result[commit] = arrayUnion(result[commit], newTags[commit]);
		} else {
			result[commit] = newTags[commit];
		}
	}

	return result;
}

function isTagTarget(target: CommonTarget): target is TagTarget {
	return 'tagger' in target;
}

async function getTags(lastCommit: string, after?: string): Promise<CommitTags> {
	const {repository} = await api.v4(`
		repository() {
			refs(
				first: 100,
				refPrefix: "refs/tags/",
				orderBy: {
					field: TAG_COMMIT_DATE,
					direction: DESC
				}
				${after ? `, after: "${after}"` : ''}
			) {
				pageInfo {
					hasNextPage
					endCursor
				}
				nodes {
					name
					target {
						commitResourcePath
						... on Tag {
							tagger {
								date
							}
						}
						... on Commit {
							committedDate
						}
					}
				}
			}
			object(expression: "${lastCommit}") {
				... on Commit {
					committedDate
				}
			}
		}
		`);
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

	const lastTag = nodes[nodes.length - 1].target;
	const lastTagIsYounger = new Date(repository.object.committedDate) < new Date(isTagTarget(lastTag) ? lastTag.tagger.date : lastTag.committedDate);

	// If the last tag is younger than last commit on the page, then not all commits are accounted for, keep looking
	if (lastTagIsYounger && repository.refs.pageInfo.hasNextPage) {
		tags = mergeTags(tags, await getTags(lastCommit, repository.refs.pageInfo.endCursor));
	}

	// There are no tags for this commit
	return tags;
}

async function init(): Promise<void | false> {
	const cacheKey = `tags:${getRepo()!.nameWithOwner}`;

	const commitsOnPage = select.all('li.js-commits-list-item');
	const lastCommitOnPage = getCommitHash(commitsOnPage[commitsOnPage.length - 1]);
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
			select('.flex-auto .d-flex.mt-1', commit)!.append(
				<div className="ml-2">
					<TagIcon/>
					<span className="ml-1">{targetTags.map((tags, i) => (
						<>
							<a href={buildRepoURL('releases/tag', tags)}>{tags}</a>
							{(i + 1) === targetTags.length ? '' : ', '}
						</>
					))}
					</span>
				</div>,
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

void features.add(__filebasename, {
	include: [
		pageDetect.isRepoCommitList,
	],
	init,
});
