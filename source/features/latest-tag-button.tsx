import './latest-tag-button.css';
import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import TagIcon from 'octicon/tag.svg';
import elementReady from 'element-ready';
import * as api from '../libs/api';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';
import fetchDom from '../libs/fetch-dom';
import {isRepoRoot} from 'github-page-detection';
import getDefaultBranch from '../libs/get-default-branch';
import {getRepoURL, getCurrentBranch, replaceBranch, getRepoGQL, getLatestVersionTag} from '../libs/utils';

interface RepoPublishState {
	latestTag: string | false;
	isUpToDate: boolean;
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

	const latestTag = getLatestVersionTag([...tags.keys()]);

	return {
		latestTag,
		isUpToDate: tags.get(latestTag) === repository.defaultBranchRef.target.oid
	};
}, {
	maxAge: 1 / 24, // One hour
	staleWhileRevalidate: 2,
	shouldRevalidate: value => typeof value === 'string',
	cacheKey: () => __filebasename + ':' + getRepoURL()
});

const getAheadByCount = cache.function(async (latestTag: string): Promise<string> => {
	const tagPage = await fetchDom(`/${getRepoURL()}/releases/tag/${latestTag}`);
	// This text is "4 commits to master since this tag"
	return select('.release-header relative-time + a[href*="/compare/"]', tagPage)!.textContent!.replace(/\D/g, '');
}, {
	maxAge: 1 / 24, // One hour
	staleWhileRevalidate: 2,
	cacheKey: ([latestTag]) => `tag-ahead-by:${getRepoURL()}/${latestTag}`
});

async function init(): Promise<false | void> {
	const {latestTag, isUpToDate} = await getRepoPublishState();
	if (!latestTag) {
		return false;
	}

	const breadcrumb = await elementReady('.breadcrumb');
	if (!breadcrumb) {
		return;
	}

	const currentBranch = getCurrentBranch();
	let href: string;
	if (isRepoRoot()) {
		href = `/${getRepoURL()}/tree/${latestTag}`;
	} else {
		href = replaceBranch(currentBranch, latestTag);
	}

	const link = (
		<a className="btn btn-sm btn-outline tooltipped tooltipped-ne ml-2" href={href}>
			<TagIcon/>
		</a>
	);

	breadcrumb.before(link);
	if (currentBranch !== latestTag) {
		link.append(' ', <span className="css-truncate-target">{latestTag}</span>);
	}

	if (currentBranch === latestTag || isUpToDate) {
		link.setAttribute('aria-label', 'You’re on the latest release');
		link.classList.add('disabled');
		return;
	}

	const defaultBranch = await getDefaultBranch();
	if (currentBranch === defaultBranch) {
		const aheadBy = await getAheadByCount(latestTag);
		link.setAttribute('aria-label', `${defaultBranch} is ${aheadBy} commits ahead of the latest release`);
		link.append(' ', <sup>+{aheadBy}</sup>);
	} else {
		link.setAttribute('aria-label', 'Visit the latest release');
	}
}

features.add({
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
