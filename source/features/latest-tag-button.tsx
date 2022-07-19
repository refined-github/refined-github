import './latest-tag-button.css';
import React from 'dom-chef';
import cache from 'webext-storage-cache';
import * as pageDetect from 'github-url-detection';
import {GitCompareIcon, TagIcon} from '@primer/octicons-react';

import features from '.';
import * as api from '../github-helpers/api';
import pluralize from '../helpers/pluralize';
import GitHubURL from '../github-helpers/github-url';
import {groupButtons} from '../github-helpers/group-buttons';
import getDefaultBranch from '../github-helpers/get-default-branch';
import addAfterBranchSelector from '../helpers/add-after-branch-selector';
import {buildRepoURL, getCurrentCommittish, getLatestVersionTag, getRepo} from '../github-helpers';

interface RepoPublishState {
	latestTag: string | false;
	aheadBy: number;
}

interface Tags {
	name: string;
	tag: {
		oid: string;
		commit?: {
			oid: string;
		};
	};
}

const undeterminableAheadBy = Number.MAX_SAFE_INTEGER; // For when the branch is ahead by more than 20 commits #5505

const getRepoPublishState = cache.function(async (): Promise<RepoPublishState> => {
	const {latestCommits, head} = await api.v4repository(`
		latestCommits: refs(first: 20, refPrefix: "refs/tags/", orderBy: {
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
		head: defaultBranchRef {
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
	`);

	if (latestCommits.nodes.length === 0) {
		return {
			latestTag: false,
			aheadBy: 0,
		};
	}

	const tags = new Map<string, string>();
	for (const node of latestCommits.nodes as Tags[]) {
		tags.set(node.name, node.tag.commit?.oid ?? node.tag.oid);
	}

	const latestTag = getLatestVersionTag([...tags.keys()]);
	const latestTagOid = tags.get(latestTag)!;
	const aheadBy = head.target.history.nodes.findIndex((node: AnyObject) => node.oid === latestTagOid);

	return {
		latestTag,
		aheadBy: aheadBy === -1 ? undeterminableAheadBy : aheadBy,
	};
}, {
	maxAge: {hours: 1},
	staleWhileRevalidate: {days: 2},
	cacheKey: () => 'tag-ahead-by:' + getRepo()!.nameWithOwner,
});

async function init(): Promise<false | void> {
	const {latestTag, aheadBy} = await getRepoPublishState();
	if (!latestTag) {
		return false;
	}

	const url = new GitHubURL(location.href);
	url.assign({
		route: url.route || 'tree', // If route is missing, it's a repo root
		branch: latestTag,
	});

	const link = (
		<a
			className="btn btn-sm ml-0 flex-self-center css-truncate rgh-latest-tag-button"
			href={url.href}
			data-pjax="#repo-content-pjax-container"
		>
			<TagIcon className="v-align-middle"/>
		</a>
	);
	await addAfterBranchSelector(link);

	const currentBranch = getCurrentCommittish();
	if (currentBranch !== latestTag) {
		link.append(' ', <span className="css-truncate-target v-align-middle">{latestTag}</span>);
	}

	const defaultBranch = await getDefaultBranch();
	const onLatestTag = currentBranch === latestTag;
	const onDefaultBranch = !currentBranch || currentBranch === defaultBranch; // `getCurrentCommittish` returns `undefined` when at the repo root on the default branch #5446
	const isAhead = aheadBy > 0;

	if (onLatestTag || (onDefaultBranch && !isAhead)) {
		link.setAttribute('aria-label', 'You’re on the latest version');
		link.classList.add('disabled', 'tooltipped', 'tooltipped-ne');
		return;
	}

	if (pageDetect.isRepoHome() || onDefaultBranch) {
		if (aheadBy !== undeterminableAheadBy) {
			link.append(<sup> +{aheadBy}</sup>);
		}

		link.setAttribute(
			'aria-label',
			isAhead
				? `${defaultBranch} is ${aheadBy === undeterminableAheadBy ? 'more than 20 commits' : pluralize(aheadBy, '1 commit', '$$ commits')} ahead of the latest version`
				: `The HEAD of ${defaultBranch} isn’t tagged`,
		);

		if (pageDetect.isRepoRoot()) {
			const compareLink = (
				<a
					className="btn btn-sm tooltipped tooltipped-ne"
					href={buildRepoURL(`compare/${latestTag}...${defaultBranch}`)}
					data-pjax="#repo-content-pjax-container"
					aria-label={`Compare ${latestTag}...${defaultBranch}`}
				>
					<GitCompareIcon className="v-align-middle"/>
				</a>
			);
			groupButtons([link, compareLink]).classList.add('d-flex');
		}
	} else {
		link.setAttribute('aria-label', 'Visit the latest version');
	}

	link.classList.add('tooltipped', 'tooltipped-ne');
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoTree,
		pageDetect.isSingleFile,
	],
	awaitDomReady: false,
	deduplicate: '.rgh-latest-tag-button', // #3945
	init,
});
