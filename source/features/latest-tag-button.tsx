import './latest-tag-button.css';
import React from 'dom-chef';
import cache from 'webext-storage-cache';
import alertIcon from 'octicon/alert.svg';
import tagIcon from 'octicon/tag.svg';
import elementReady from 'element-ready';
import compareVersions from 'tiny-version-compare';
import * as api from '../libs/api';
import features from '../libs/features';
import {isRepoRoot} from '../libs/page-detect';
import {getRepoURL, getCurrentBranch, replaceBranch, getRepoGQL} from '../libs/utils';

class TagInfo {
	name: string;
	oid: string;
	date: string;
	constructor(tag: {name: string; target: {oid: string; committedDate: string}}) {
		this.name = tag.name;
		this.oid = tag.target.oid;
		this.date = tag.target.committedDate;
	}
}

const getLatestTag = cache.function(async (): Promise<TagInfo | false> => {
	const {repository} = await api.v4(`
		repository(${getRepoGQL()}) {
			refs(first: 20, refPrefix: "refs/tags/", orderBy: {
				field: TAG_COMMIT_DATE,
				direction: DESC
			}) {
				nodes {
					name
					target {
						oid
						... on Commit {
							committedDate
						}
					}
				}
			}
		}
	`);

	const tags: TagInfo[] = repository.refs.nodes.map((tag: {name: string; target: {oid: string; committedDate: string}}) => new TagInfo(tag));
	if (tags.length === 0) {
		return false;
	}

	// If all tags are plain versions, parse them
	if (tags.every(tag => /^[vr]?\d/.test(tag.name))) {
		return tags.sort((o1, o2) => compareVersions(o1.name, o2.name)).pop()!;
	}

	// Otherwise just use the latest
	return tags[0];
}, {
	expiration: 1,
	cacheKey: () => __featureName__ + '_tags:' + getRepoURL()
});

const masterHasCommitsAfter = cache.function(async (commitDate: string): Promise<boolean> => {
	// Find out whether we have commits after a certain date
	const repository = await api.v4(`
		repository(${getRepoGQL()}) {
			object(expression: "master") {
				... on Commit {
				    oid
				    history(first: 10, since: "${commitDate}") {
					    nodes {
					        committedDate
					    }
				    }
				}
			}
		}
	`);
	const commitList = repository.repository.object.history.nodes;
	// The commit on this exact date is always returned - we only want to know whether there was another commit afterwards
	return commitList && commitList.length > 1;
}, {
	expiration: 1,
	cacheKey: () => __featureName__ + '_commits:' + getRepoURL()
});

async function getTagLink(latestRelease: TagInfo): Promise<HTMLAnchorElement> {
	const link = <a className="btn btn-sm btn-outline tooltipped tooltipped-ne ml-2">{tagIcon()}</a> as unknown as HTMLAnchorElement;

	const currentBranch = getCurrentBranch();
	if (currentBranch === latestRelease.name) {
		const [isBleedingEdge] = await Promise.all([
			masterHasCommitsAfter(latestRelease.date)
		]);
		if (isBleedingEdge) {
			link.setAttribute('aria-label', 'Current branch is bleeding edge');
			link.append(' ', <span className="css-truncate-target">{latestRelease.name}</span>);
			link.append(' ', alertIcon());
		} else {
			link.setAttribute('aria-label', 'You’re on the latest release');
			link.classList.add('disabled');
		}
	} else {
		if (isRepoRoot()) {
			link.href = `/${getRepoURL()}/tree/${latestRelease.name}`;
		} else {
			link.href = replaceBranch(currentBranch, latestRelease.name);
		}

		link.setAttribute('aria-label', 'Visit the latest release');
		link.append(' ', <span className="css-truncate-target">{latestRelease.name}</span>);
	}

	return link;
}

async function init(): Promise<false | void> {
	const [breadcrumbs, latestTag] = await Promise.all([
		elementReady('.breadcrumb'),
		getLatestTag()
	]);

	if (!breadcrumbs || !latestTag) {
		return false;
	}

	const [tagLink] = await Promise.all([getTagLink(latestTag)]);

	breadcrumbs.before(tagLink);
}

features.add({
	id: __featureName__,
	description: 'Adds link to the latest version tag on directory listings and files.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/71885167-63464500-316c-11ea-806c-5abe37281eca.png',
	include: [
		features.isRepoTree,
		features.isSingleFile
	],
	load: features.nowAndOnAjaxedPages,
	init
});
