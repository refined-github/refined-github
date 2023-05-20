import React from 'dom-chef';
import cache from 'webext-storage-cache';
import * as pageDetect from 'github-url-detection';
import {TagIcon} from '@primer/octicons-react';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import api from '../github-helpers/api.js';
import {addAfterBranchSelector, buildRepoURL, cacheByRepo, getLatestVersionTag} from '../github-helpers/index.js';
import isDefaultBranch from '../github-helpers/is-default-branch.js';
import getDefaultBranch from '../github-helpers/get-default-branch.js';
import pluralize from '../helpers/pluralize.js';
import {branchSelectorParent} from '../github-helpers/selectors.js';

type RepoPublishState = {
	latestTag: string | false;
	aheadBy: number;
};

type Tags = {
	name: string;
	tag: {
		oid: string;
		commit?: {
			oid: string;
		};
	};
};

export const undeterminableAheadBy = Number.MAX_SAFE_INTEGER; // For when the branch is ahead by more than 20 commits #5505

export const getRepoPublishState = cache.function('tag-ahead-by', async (): Promise<RepoPublishState> => {
	const {repository} = await api.v4(`
		repository() {
			refs(first: 20, refPrefix: "refs/tags/", orderBy: {
				field: TAG_COMMIT_DATE,
				direction: DESC
			}) {
				nodes {
					name
					tag: target {
						oid
						... on Tag {
							commit: target {
								oid
							}
						}
					}
				}
			}
			defaultBranchRef {
				target {
					... on Commit {
						history(first: 20) {
							nodes {
								oid
							}
						}
					}
				}
			}
		}
	`);

	if (repository.refs.nodes.length === 0) {
		return {
			latestTag: false,
			aheadBy: 0,
		};
	}

	const tags = new Map<string, string>();
	for (const node of repository.refs.nodes as Tags[]) {
		tags.set(node.name, node.tag.commit?.oid ?? node.tag.oid);
	}

	const latestTag = getLatestVersionTag([...tags.keys()]);
	const latestTagOid = tags.get(latestTag)!;
	const aheadBy = repository.defaultBranchRef.target.history.nodes.findIndex((node: AnyObject) => node.oid === latestTagOid);

	return {
		latestTag,
		aheadBy: aheadBy === -1 ? undeterminableAheadBy : aheadBy,
	};
}, {
	maxAge: {hours: 1},
	staleWhileRevalidate: {days: 2},
	cacheKey: cacheByRepo,
});

async function add(branchSelectorParent: HTMLDetailsElement): Promise<void> {
	const {latestTag, aheadBy} = await getRepoPublishState();
	const isAhead = aheadBy > 0;

	if (!latestTag || !isAhead) {
		return;
	}

	const commitCount
		= aheadBy === undeterminableAheadBy
			? 'more than 20 unreleased commits'
			: pluralize(aheadBy, '$$ unreleased commit');
	const label = `There are ${commitCount} since ${latestTag}`;

	addAfterBranchSelector(
		branchSelectorParent,
		<a
			className="btn px-2 tooltipped tooltipped-ne"
			href={buildRepoURL('compare', `${latestTag}...${await getDefaultBranch()}`)}
			aria-label={label}
		>
			<TagIcon className="v-align-middle"/>
			{aheadBy === undeterminableAheadBy || <sup className="ml-n2"> +{aheadBy}</sup>}
		</a>,
	);
}

async function init(signal: AbortSignal): Promise<false | void> {
	if (!await isDefaultBranch()) {
		return false;
	}

	await api.expectToken();

	observe(branchSelectorParent, add, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoHome,
	],
	awaitDomReady: true, // DOM-based exclusions
	init,
});

/*

Test URLs

Repo with no tags (no button)
https://github.com/refined-github/yolo

Repo with too many unreleased commits
https://github.com/refined-github/sandbox

Repo with some unreleased commits
https://github.com/refined-github/refined-github

*/
