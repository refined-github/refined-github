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
import getDefaultBranch from '../libs/get-default-branch';
import {getRepoURL, getCurrentBranch, replaceBranch, getRepoGQL} from '../libs/utils';

const getLatestTag = cache.function(async (): Promise<string | false> => {
	const {repository} = await api.v4(`
		repository(${getRepoGQL()}) {
			refs(first: 20, refPrefix: "refs/tags/", orderBy: {
				field: TAG_COMMIT_DATE,
				direction: DESC
			}) {
				nodes {
					name
				}
			}
		}
	`);

	const tags: string[] = repository.refs.nodes.map((tag: {name: string}) => tag.name);
	if (tags.length === 0) {
		return false;
	}

	// If all tags are plain versions, parse them
	if (tags.every(tag => /^[vr]?\d/.test(tag))) {
		return tags.sort(compareVersions).pop()!;
	}

	// Otherwise just use the latest
	return tags[0];
}, {
	expiration: 1,
	cacheKey: () => __featureName__ + '_tags:' + getRepoURL()
});

async function currentBranchIsBleedingEdge(latestTag: string, defaultBranch: string, currentBranch: string): Promise<boolean> {
	// Only default branch can be cutting edge (i.e., ahead of latest release)
	if (currentBranch !== defaultBranch) {
		return false;
	}

	// Find the last commits from the default branch and latest tag
	const repository = await api.v4(`
		repository(${getRepoGQL()}) {
			latestTag:object(expression: "${latestTag}") {
				... on Commit {
					oid
				}
			  },
			  defaultBranch:object(expression: "${defaultBranch}") {
				... on Commit {
					oid
				}
			}
		}
	`);
	// If the default branch has a different (later) commit, it's considered bleeding edge
	return repository.repository.defaultBranch!.oid !== repository.repository.latestTag!.oid;
}

async function getTagLink(latestRelease: string): Promise<HTMLAnchorElement> {
	const link = <a className="btn btn-sm btn-outline tooltipped tooltipped-ne ml-2">{tagIcon()}</a> as unknown as HTMLAnchorElement;

	const currentBranch = getCurrentBranch();
	const defaultBranch = await getDefaultBranch();
	const [isBleedingEdge] = await Promise.all([
		currentBranchIsBleedingEdge(latestRelease, defaultBranch, currentBranch)
	]);
	if (currentBranch === latestRelease) {
		link.classList.add('disabled');
		link.setAttribute('aria-label', 'You’re on the latest release');
	} else {
		link.append(' ', <span className="css-truncate-target">{latestRelease}</span>);
		if (isBleedingEdge) {
			link.setAttribute('aria-label', 'Current branch is bleeding edge');
			link.append(' ', alertIcon());
		} else {
			link.setAttribute('aria-label', 'Visit the latest release');
		}

		if (isRepoRoot()) {
			link.href = `/${getRepoURL()}/tree/${latestRelease}`;
		} else {
			link.href = replaceBranch(currentBranch, latestRelease);
		}
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
