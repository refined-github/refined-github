import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import TagIcon from 'octicon/tag.svg';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';
import * as api from '../libs/api';
import {getOwnerAndRepo, getRepoURL, getRepoGQL} from '../libs/utils';

interface CommitTags {
	[name: string]: string[];
}

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
interface TagNode {
	name: string;
	target: CommonTarget;
}

const {ownerName, repoName} = getOwnerAndRepo();
const cacheKey = `tags:${ownerName!}/${repoName!}`;

function mergeTags(oldTags: CommitTags, newTags: CommitTags): CommitTags {
	const result: CommitTags = {...oldTags};
	for (const commit in newTags) {
		if (result[commit]) {
			result[commit] = [...new Set(result[commit].concat(newTags[commit]))];
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
		repository(${getRepoGQL()}) {
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
	const {nodes}: {nodes: TagNode[]} = repository.refs;
	let tags = nodes.reduce((tags: CommitTags, node: TagNode) => {
		const commit = node.target.commitResourcePath.split('/')[4];
		const {name} = node;
		if (!tags[commit]) {
			tags[commit] = [];
		}

		tags[commit].push(name);

		return tags;
	}, {});

	// If there are no tags in the repository
	if (nodes.length === 0) {
		return tags;
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
	const commitsOnPage = select.all('li.commit');
	const lastCommitOnPage = (commitsOnPage[commitsOnPage.length - 1].dataset.channel as string).split(':')[3];
	let cached = await cache.get<{[commit: string]: string[]}>(cacheKey) ?? {};
	const commitsWithNoTags = [];
	for (const commit of commitsOnPage) {
		const targetCommit = (commit.dataset.channel as string).split(':')[3];
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
			select('.commit-meta', commit)!.append(
				<div className="ml-2">
					<TagIcon/>
					<span className="ml-1">{targetTags.map((tags, i) => (
						<>
							<a href={`/${getRepoURL()}/releases/tag/${tags}`}>{tags}</a>
							{(i + 1) === targetTags.length ? '' : ', '}
						</>
					))}
					</span>
				</div>
			);
		}
	}

	if (commitsWithNoTags.length > 0) {
		for (const commit of commitsWithNoTags) {
			cached[commit] = [];
		}
	}

	await cache.set(cacheKey, cached, 1);
}

features.add({
	id: __filebasename,
	description: 'Display the corresponding tags next to commits',
	screenshot: 'https://user-images.githubusercontent.com/14323370/66400400-64ba7280-e9af-11e9-8d6c-07b35afde91f.png'
}, {
	include: [
		pageDetect.isRepoCommitList
	],
	init
});
