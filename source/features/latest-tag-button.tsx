import './latest-tag-button.css';
import React from 'dom-chef';
import cache from 'webext-storage-cache';
import TagIcon from 'octicon/tag.svg';
import DiffIcon from 'octicon/diff.svg';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';
import GitHubURL from '../github-helpers/github-url';
import {groupButtons} from '../github-helpers/group-buttons';
import getDefaultBranch from '../github-helpers/get-default-branch';
import {getRepoURL, getCurrentBranch, getRepoGQL, getLatestVersionTag} from '../github-helpers';

interface RepoPublishState {
	latestTag: string | false;
	isUpToDate: boolean;
	aheadBy?: string;
}

const getRepoPublishState = cache.function(async (): Promise<RepoPublishState> => {
	const {repository} = await api.v4(`
		repository(${getRepoGQL()}) {
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
					oid
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
			isUpToDate: false
		};
	}

	const tags = new Map<string, string>();
	for (const node of repository.refs.nodes) {
		tags.set(node.name, node.tag.commit?.oid ?? node.tag.oid);
	}

	const repoCommits = new Map<string, string>();
	for (const [index, {oid}] of repository.defaultBranchRef.target.history.nodes.entries()) {
		repoCommits.set(oid, index);
	}

	const latestTag = getLatestVersionTag([...tags.keys()]);
	const latestTagOid = tags.get(latestTag)!;

	return {
		latestTag,
		isUpToDate: tags.get(latestTag) === repository.defaultBranchRef.target.oid,
		aheadBy: repoCommits.get(latestTagOid)! ?? '20+'
	};
}, {
	maxAge: 0, // One hour
	staleWhileRevalidate: 2,
	cacheKey: () => __filebasename + ':' + getRepoURL()
});

async function init(): Promise<false | void> {
	const {latestTag, isUpToDate, aheadBy} = await getRepoPublishState();
	if (!latestTag) {
		return false;
	}

	const breadcrumb = await elementReady('.breadcrumb');
	if (!breadcrumb) {
		return;
	}

	const currentBranch = getCurrentBranch();
	const url = new GitHubURL(location.href);
	url.assign({
		route: url.route || 'tree', // If route is missing, it's a repo root
		branch: latestTag
	});

	const link = (
		<a className="btn btn-sm btn-outline ml-2" href={String(url)}>
			<TagIcon/>
		</a>
	);

	breadcrumb.before(link);
	if (currentBranch !== latestTag) {
		link.append(' ', <span className="css-truncate-target">{latestTag}</span>);
	}

	if (currentBranch === latestTag || isUpToDate) {
		link.setAttribute('aria-label', 'You’re on the latest release');
		link.classList.add('disabled', 'tooltipped', 'tooltipped-ne');
		return;
	}

	const defaultBranch = await getDefaultBranch();
	const compareLink = (
		<a className="btn btn-sm btn-outline pl-1 tooltipped tooltipped-ne" href={`/${getRepoURL()}/compare/${latestTag}...${defaultBranch}`}>
			<DiffIcon/>
		</a>
	);
	if (currentBranch === defaultBranch) {
		compareLink.append(' ', aheadBy! === '20+' ? aheadBy : `+${aheadBy!}`);
		compareLink.setAttribute('aria-label', `${defaultBranch} is ${aheadBy!} commits ahead of the latest release`);
		groupButtons([link, compareLink]);
	} else {
		link.setAttribute('aria-label', 'Visit the latest release');
		link.classList.add('tooltipped', 'tooltipped-ne');
	}
}

void features.add({
	id: __filebasename,
	description: 'Adds link to the latest version tag on directory listings and files.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/74594998-71df2080-5077-11ea-927c-b484ca656e88.png'
}, {
	include: [
		pageDetect.isRepoTree,
		pageDetect.isSingleFile
	],
	waitForDomReady: false,
	init
});
