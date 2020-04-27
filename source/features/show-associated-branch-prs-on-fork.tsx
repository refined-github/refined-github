import React from 'dom-chef';
import select from 'select-dom';
import cache from 'webext-storage-cache';
import mergeIcon from 'octicon/git-merge.svg';
import pullRequestIcon from 'octicon/git-pull-request.svg';
import * as api from '../libs/api';
import features from '../libs/features';
import * as pageDetect from '../libs/page-detect';
import {getRepoURL, getRepoGQL} from '../libs/utils';
import observeElement from '../libs/simplified-element-observer';

interface PullRequest {
	number: number;
	state: string;
	isDraft: boolean;
	url: string;
}

const getPullRequestsAssociatedWithBranch = cache.function(async (): Promise<Record<string, PullRequest>> => {
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
	for (const {name, associatedPullRequests} of repository.refs.nodes) {
		if (associatedPullRequests.nodes.length > 0) {
			const [prInfo] = associatedPullRequests.nodes;
			prInfo.state = prInfo.isDraft && prInfo.state === 'OPEN' ? 'Draft' : upperCaseFirst(prInfo.state);
			(pullRequests as AnyObject)[name] = prInfo;
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

const stateClass: Record<string, string> = {
	Open: '--green',
	Closed: '--red',
	Merged: '--purple',
	Draft: ''
};

function styledIcon(state: string): SVGElement {
	const styledIcon = state === 'Merged' ? mergeIcon() : pullRequestIcon();
	styledIcon.setAttribute('width', '10');
	styledIcon.setAttribute('height', '14');
	return styledIcon;
}

async function init(): Promise<void> {
	const associatedPullRequests = await getPullRequestsAssociatedWithBranch();

	for (const branch of select.all('[branch]')) {
		const prInfo = associatedPullRequests[branch.getAttribute('branch')!];
		if (prInfo) {
			select('.test-compare-link', branch)!.replaceWith(
				<div className="d-inline-block text-right ml-3">
					<a
						data-issue-and-pr-hovercards-enabled
						href={prInfo.url}
						className="muted-link"
						data-hovercard-type="pull_request"
						data-hovercard-url={prInfo.url + '/hovercard'}
					>
						#{prInfo.number}
					</a>
					<a
						className={`State State${stateClass[prInfo.state]} State--small ml-1 no-underline`}
						title={`Status: ${prInfo.state}`}
						href={prInfo.url}
					>
						{styledIcon(prInfo.state)} {prInfo.state}
					</a>
				</div>);
		}
	}
}

features.add({
	id: __filebasename,
	description: 'Shows the associated pull requests on branches for forked repository’s',
	screenshot: 'https://user-images.githubusercontent.com/16872793/79875403-9d53f380-83b7-11ea-8dc9-62ef9d3a3ca1.png'
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
