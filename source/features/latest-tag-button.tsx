import './latest-tag-button.css';
import React from 'dom-chef';
import cache from 'webext-storage-cache';
import TagIcon from 'octicon/tag.svg';
import DiffIcon from 'octicon/diff.svg';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import * as api from '../github-helpers/api';
import pluralize from '../helpers/pluralize';
import GitHubURL from '../github-helpers/github-url';
import {groupButtons} from '../github-helpers/group-buttons';
import getDefaultBranch from '../github-helpers/get-default-branch';
import {getRepoURL, getCurrentBranch, getRepoGQL, getLatestVersionTag} from '../github-helpers';

interface RepoPublishState {
	latestTag: string | false;
	aheadBy?: number;
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
			latestTag: false
		};
	}

	const tags = new Map<string, string>();
	for (const node of repository.refs.nodes) {
		tags.set(node.name, node.tag.commit?.oid ?? node.tag.oid);
	}

	const latestTag = getLatestVersionTag([...tags.keys()]);
	const latestTagOid = tags.get(latestTag)!;
	const aheadBy = repository.defaultBranchRef.target.history.nodes.findIndex((node: AnyObject) => node.oid === latestTagOid);

	if (aheadBy < 0) {
		return {latestTag};
	}

	return {latestTag, aheadBy};
}, {
	maxAge: {hours: 1},
	staleWhileRevalidate: {
		days: 2
	},
	cacheKey: () => `tag-ahead-by:${getRepoURL()}`
});

async function init(): Promise<false | void> {
	const {latestTag, aheadBy} = await getRepoPublishState();
	if (!latestTag) {
		return false;
	}

	const currentBranch = getCurrentBranch();
	const url = new GitHubURL(location.href);
	url.assign({
		route: url.route || 'tree', // If route is missing, it's a repo root
		branch: latestTag
	});

	const link = (
		<a className="btn btn-sm btn-outline ml-2 flex-self-center rgh-latest-tag-button" href={String(url)}>
			<TagIcon/>
		</a>
	);

	select('#branch-select-menu')!.parentElement!.after(link);
	if (currentBranch !== latestTag) {
		link.append(' ', <span className="css-truncate-target">{latestTag}</span>);
	}

	if (currentBranch === latestTag || aheadBy === 0) {
		link.setAttribute('aria-label', 'You’re on the latest release');
		link.classList.add('disabled', 'tooltipped', 'tooltipped-ne');
		return;
	}

	const defaultBranch = await getDefaultBranch();
	if (currentBranch === defaultBranch) {
		link.append(<sup> +{aheadBy}</sup>);
		link.setAttribute(
			'aria-label',
			aheadBy ?
				`${defaultBranch} is ${pluralize(aheadBy, '1 commit', '$$ commits')} ahead of the latest release` :
				`The HEAD of ${defaultBranch} isn’t tagged`
		);

		if (pageDetect.isRepoRoot()) {
			const compareLink = (
				<a
					className="btn btn-sm btn-outline tooltipped tooltipped-ne"
					href={`/${getRepoURL()}/compare/${latestTag}...${defaultBranch}`}
					aria-label={`Compare ${latestTag}...${defaultBranch}`}
				>
					<DiffIcon/>
				</a>
			);
			groupButtons([link, compareLink]).classList.add('flex-self-center', 'd-flex');
		}
	} else {
		link.setAttribute('aria-label', 'Visit the latest release');
	}

	link.classList.add('tooltipped', 'tooltipped-ne');
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
	awaitDomReady: false,
	init
});
