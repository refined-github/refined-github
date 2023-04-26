import React from 'dom-chef';
import cache from 'webext-storage-cache';
import * as pageDetect from 'github-url-detection';
import {TagIcon} from '@primer/octicons-react';

import features from '../feature-manager';
import observe from '../helpers/selector-observer';
import * as api from '../github-helpers/api';
import {buildRepoURL, cacheByRepo, getCurrentCommittish, getLatestVersionTag} from '../github-helpers';
import getDefaultBranch from '../github-helpers/get-default-branch';
import pluralize from '../helpers/pluralize';

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

async function add(branchSelector: HTMLElement): Promise<void> {
	const defaultBranch = await getDefaultBranch();
	const currentBranch = getCurrentCommittish();

	const onDefaultBranch = !currentBranch || currentBranch === defaultBranch; // `getCurrentCommittish` returns `undefined` when at the repo root on the default branch #5446
	if (!onDefaultBranch) {
		return;
	}

	const {latestTag, aheadBy} = await getRepoPublishState();
	const isAhead = aheadBy > 0;

	if (!latestTag || !isAhead) {
		return;
	}

	const commitCount = aheadBy === undeterminableAheadBy ? 'more than 20 commits' : pluralize(aheadBy, '$$ commit');
	const label
		= isAhead
			? `${defaultBranch} is ${commitCount} ahead of the latest version`
			: `The HEAD of ${defaultBranch} isn’t tagged`;

	// TODO: use .position-relative:has(> #branch-select-menu)
	branchSelector.parentElement!.after(
		<a
			className="btn ml-2 px-2 tooltipped tooltipped-ne"
			data-turbo-frame="repo-content-turbo-frame"
			href={buildRepoURL('compare', `${latestTag}...${defaultBranch}`)}
			aria-label={label}
		>
			<TagIcon className="v-align-middle"/>
			{aheadBy === undeterminableAheadBy || <sup className="ml-n2"> +{aheadBy}</sup>}
		</a>,
	);
}

async function init(signal: AbortSignal): Promise<false | void> {
	await api.expectToken();

	observe('#branch-select-menu, [data-testid="anchor-button"]', add, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoTree,
		pageDetect.isSingleFile,
	],
	awaitDomReady: true, // DOM-based exclusions
	init,
});

/*
Test URLs

PR without conflicts
https://github.com/refined-github/sandbox/pull/60

Draft PR without conflicts
https://github.com/refined-github/sandbox/pull/61

Native "Update branch" button
(pick a conflict-free PR from https://github.com/refined-github/refined-github/pulls?q=is%3Apr+is%3Aopen+sort%3Acreated-asc)

Native "Resolve conflicts" button
https://github.com/refined-github/sandbox/pull/9

Cross-repo PR with long branch names
https://github.com/refined-github/sandbox/pull/13

*/
