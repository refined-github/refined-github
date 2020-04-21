import React from 'dom-chef';
import select from 'select-dom';
import cache from 'webext-storage-cache';
import mergeIcon from 'octicon/git-merge.svg';
import pullRequestIcon from 'octicon/git-pull-request.svg';
import * as api from '../libs/api';
import features from '../libs/features';
import * as pageDetect from '../libs/page-detect';
import observeElement from '../libs/simplified-element-observer';
import {getRepoURL, getRepoGQL, getOwnerAndRepo, getUsername} from '../libs/utils';

interface PullRequest {
	number: number;
	state: string;
	isDraft: boolean;
	url: string;
}

const getOpenPullRequests = cache.function(async (): Promise<Record<string, PullRequest>> => {
	const {repository} = await api.v4(`
		repository(${getRepoGQL()}) {
			refs(refPrefix: "refs/heads/", last: 100) {
				nodes {
					name
					associatedPullRequests(last: 1, orderBy: {field: CREATED_AT, direction: DESC}) {
						nodes {
							number
							state
							isDraft
							url
						}
					}
				}
			}
		}
	`);

	const pullRequests = {};
	for (const branches of repository.refs.nodes) {
		if (branches.associatedPullRequests.nodes.length > 0) {
			pullRequests[branches.name] = branches.associatedPullRequests.nodes[0];
		}
	}

	return pullRequests;
}, {
	maxAge: 1 / 2,
	staleWhileRevalidate: 4,
	cacheKey: () => 'associatedBranchPullRequests:' + getRepoURL()
});

// https://github.com/idimetrix/text-case/blob/master/packages/upper-case-first/src/index.ts
function upperCaseFirst(input: string): string {
	return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
}

const stateClass = {
	MERGED: 'purple',
	CLOSED: 'red',
	OPEN: 'green'
};

async function init(): Promise<void | false> {
	const {ownerName} = getOwnerAndRepo();
	if (ownerName !== getUsername()) {
		return false;
	}

	const openPullRequests = await getOpenPullRequests();

	for (const branch of select.all('[branch]')) {
		const prInfo = openPullRequests[branch.getAttribute('branch')!];
		if (prInfo) {
			const path = prInfo.url.replace(location.origin, '');
			select('.test-compare-link', branch.parentElement!)!.replaceWith(
				<div className="d-inline-block text-right ml-3">
					<a
						data-issue-and-pr-hovercards-enabled
						href={prInfo.url}
						className="muted-link"
						data-hovercard-type="pull_request"
						data-hovercard-url={path + '/hovercard'}
					>
						#{prInfo.number}
					</a>
					<a
						className={`State State${prInfo.isDraft ? '' : `--${stateClass[prInfo.state]}`} State--small ml-1 no-underline`}
						title={`Status: ${upperCaseFirst(prInfo.state)}`}
						href={path}
					>
						{prInfo.state === 'MERGED' ? mergeIcon() : pullRequestIcon()} {prInfo.isDraft ? 'Draft' : upperCaseFirst(prInfo.state)}
					</a>
				</div>);
		}
	}
}

features.add({
	id: __filebasename,
	description: 'Shows the associated pull requests on branches for forked repository’s',
	screenshot: 'https://user-images.githubusercontent.com/16872793/79803218-908bbd00-832f-11ea-89cd-fdd2aaea4a87.png'
}, {
	include: [
		pageDetect.isBranches
	],
	exclude: [
		() => !pageDetect.isForkedRepo()
	],
	init: () => {
		observeElement('[data-target="branch-filter-controller.results"]', init);
	}
});
