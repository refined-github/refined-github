import './latest-tag-button.css';
import React from 'dom-chef';
import select from 'select-dom';
import tagIcon from 'octicon/tag.svg';
import compareVersions from 'tiny-version-compare';
import * as api from '../libs/api';
import features from '../libs/features';
import {isRepoRoot} from '../libs/page-detect';
import {getRepoURL, getCurrentBranch, replaceBranch, getRepoGQL} from '../libs/utils';

async function getLatestTag(): Promise<string | undefined> {
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
		return;
	}

	// If all tags are plain versions, parse them
	if (tags.every(tag => /^[vr]?\d/.test(tag))) {
		return tags.sort(compareVersions).pop()!;
	}

	// Otherwise just use the latest
	return tags[0];
}

function getTagLink(latestRelease: string): HTMLAnchorElement {
	const link = <a className="btn btn-sm btn-outline tooltipped tooltipped-ne ml-2">{tagIcon()}</a> as unknown as HTMLAnchorElement;

	const currentBranch = getCurrentBranch();

	if (currentBranch === latestRelease) {
		link.classList.add('disabled');
		link.setAttribute('aria-label', 'You’re on the latest release');
	} else {
		if (isRepoRoot()) {
			link.href = `/${getRepoURL()}/tree/${latestRelease}`;
		} else {
			link.href = replaceBranch(currentBranch, latestRelease);
		}

		link.setAttribute('aria-label', 'Visit the latest release');
		link.append(' ', <span className="css-truncate-target">{latestRelease}</span>);
	}

	return link;
}

async function init(): Promise<false | void> {
	const breadcrumbs = select('.breadcrumb');
	if (!breadcrumbs) {
		return false;
	}

	const latestTag = await getLatestTag();
	if (latestTag) {
		breadcrumbs.before(getTagLink(latestTag));
	}
}

features.add({
	id: __featureName__,
	description: 'Adds link to the latest version tag on directory listings and files.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/71885167-63464500-316c-11ea-806c-5abe37281eca.png',
	include: [
		features.isRepoTree,
		features.isSingleFile
	],
	load: features.onAjaxedPages,
	init
});
