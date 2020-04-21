import React from 'dom-chef';
import select from 'select-dom';
import cache from 'webext-storage-cache';
import mergeIcon from 'octicon/git-merge.svg';
import pullRequestIcon from 'octicon/git-pull-request.svg';
import * as api from '../libs/api';
import features from '../libs/features';
import {isForkedRepo} from '../libs/page-detect';
import * as pageDetect from '../libs/page-detect';
import {getRepoURL, getRepoGQL} from '../libs/utils';
import observeElement from '../libs/simplified-element-observer';

const getOpenPullRequests = cache.function(async (): Promise<AnyObject> => {
	const {repository} = await api.v4(`
		repository(${getRepoGQL()}) {
			refs(refPrefix: "refs/heads/", last: 100) {
				nodes {
					name
					associatedPullRequests(last: 1, orderBy: {field: CREATED_AT, direction: DESC}) {
						nodes {
							number
							state
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
	maxAge: 1 / 24 / 2, // Stale after half an hour
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
	if (!isForkedRepo()) {
		return;
	}

	const openPullRequests = await getOpenPullRequests();

	for (const branch of select.all('[branch]')) {
		const prInfo = openPullRequests[branch.getAttribute('branch')!];
		if (prInfo && !branch.classList.contains('rgh-show-associated-branch-prs-on-fork')) {
			branch.classList.add('rgh-show-associated-branch-prs-on-fork');
			const path = prInfo.url.replace(location.origin, '') as string;
			select('.test-compare-link', branch.parentElement!)!.replaceWith(
				<div className="d-inline-block text-right ml-3">
					<a data-issue-and-pr-hovercards-enabled href={path} className="muted-link" data-hovercard-type="pull_request" data-hovercard-url={path + '/hovercard'}>
						#{prInfo.number}
					</a>
					<a className={`State State--${stateClass[prInfo.state]} State--small ml-1 no-underline`} title={`Status: ${upperCaseFirst(prInfo.state)}`} href={path}>
						{prInfo.state === 'MERGED' ? mergeIcon() : pullRequestIcon()}{' '}{upperCaseFirst(prInfo.state)}
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
	waitForDomReady: false,
	init: () => {
		observeElement('[data-target="branch-filter-controller.results"]', init);
		return false;
	}
});
