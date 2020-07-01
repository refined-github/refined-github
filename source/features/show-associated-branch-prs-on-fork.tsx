import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import MergeIcon from 'octicon/git-merge.svg';
import * as pageDetect from 'github-url-detection';
import PullRequestIcon from 'octicon/git-pull-request.svg';

import features from '.';
import * as api from '../github-helpers/api';
import observeElement from '../helpers/simplified-element-observer';
import {getRepoGQL, getRepoURL, upperCaseFirst} from '../github-helpers';

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
							timelineItems(last: 1, itemTypes: [HEAD_REF_DELETED_EVENT, HEAD_REF_RESTORED_EVENT]) {
								nodes {
									__typename
								}
							}
						}
					}
				}
			}
		}
	`);

	const pullRequests: Record<string, PullRequest> = {};
	for (const {name, associatedPullRequests} of repository.refs.nodes) {
		const [prInfo] = associatedPullRequests.nodes;
		// Check if the ref was deleted, since the result includes pr's that are not in fact related to this branch but rather to the branch name.
		const headRefWasDeleted = prInfo?.timelineItems.nodes[0]?.__typename === 'HeadRefDeletedEvent';
		if (prInfo && !headRefWasDeleted) {
			prInfo.state = prInfo.isDraft && prInfo.state === 'OPEN' ? 'Draft' : upperCaseFirst(prInfo.state);
			pullRequests[name] = prInfo;
		}
	}

	return pullRequests;
}, {
	maxAge: 1 / 2,
	staleWhileRevalidate: 4,
	cacheKey: () => 'associatedBranchPullRequests:' + getRepoURL()
});

const stateClass: Record<string, string> = {
	Open: '--green',
	Closed: '--red',
	Merged: '--purple',
	Draft: ''
};

async function init(): Promise<void> {
	const associatedPullRequests = await getPullRequestsAssociatedWithBranch();

	for (const branchCompareLink of select.all('.test-compare-link')) {
		const branchName = branchCompareLink.closest('[branch]')!.getAttribute('branch')!;
		const prInfo = associatedPullRequests[branchName];
		if (prInfo) {
			const StateIcon = prInfo.state === 'Merged' ? MergeIcon : PullRequestIcon;

			branchCompareLink.replaceWith(
				<div className="d-inline-block text-right ml-3">
					<a
						data-issue-and-pr-hovercards-enabled
						href={prInfo.url}
						className="muted-link"
						data-hovercard-type="pull_request"
						data-hovercard-url={prInfo.url + '/hovercard'}
					>
						#{prInfo.number}{' '}
					</a>
					<a
						className={`State State${stateClass[prInfo.state]} State--small ml-1 no-underline`}
						title={`Status: ${prInfo.state}`}
						href={prInfo.url}
					>
						<StateIcon width={10} height={14}/> {prInfo.state}
					</a>
				</div>);
		}
	}
}

void features.add({
	id: __filebasename,
	description: 'Shows the associated pull requests on branches for forked repository’s.',
	screenshot: 'https://user-images.githubusercontent.com/16872793/81504659-7e5ec800-92b8-11ea-9ee6-924110e8cca1.png'
}, {
	include: [
		pageDetect.isBranches
	],
	exclude: [
		() => !pageDetect.isForkedRepo()
	],
	init: () => {
		observeElement([
			'[data-target="branch-filter-controller.results"]', // Pre "Repository refresh" layout
			'[data-target="branch-filter.result"]'
		].join(), init);
	}
});
