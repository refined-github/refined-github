import React from 'dom-chef';
import cache from 'webext-storage-cache';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';
import {GitMergeIcon, GitPullRequestIcon, GitPullRequestClosedIcon, GitPullRequestDraftIcon} from '@primer/octicons-react';

import features from '../feature-manager';
import * as api from '../github-helpers/api';
import {getRepo, upperCaseFirst} from '../github-helpers';

type PullRequest = {
	timelineItems: {
		nodes: AnyObject;
	};
	number: number;
	state: keyof typeof stateIcon;
	isDraft: boolean;
	url: string;
};

export const getPullRequestsAssociatedWithBranch = cache.function(async (): Promise<Record<string, PullRequest>> => {
	const {repository} = await api.v4(`
		repository() {
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
		const [prInfo] = associatedPullRequests.nodes as PullRequest[];
		// Check if the ref was deleted, since the result includes pr's that are not in fact related to this branch but rather to the branch name.
		const headRefWasDeleted = prInfo?.timelineItems.nodes[0]?.__typename === 'HeadRefDeletedEvent';
		if (prInfo && !headRefWasDeleted) {
			prInfo.state = prInfo.isDraft && prInfo.state === 'OPEN' ? 'DRAFT' : prInfo.state;
			pullRequests[name] = prInfo;
		}
	}

	return pullRequests;
}, {
	maxAge: {hours: 1},
	staleWhileRevalidate: {days: 4},
	cacheKey: () => 'associatedBranchPullRequests:' + getRepo()!.nameWithOwner,
});

export const stateIcon = {
	OPEN: GitPullRequestIcon,
	CLOSED: GitPullRequestClosedIcon,
	MERGED: GitMergeIcon,
	DRAFT: GitPullRequestDraftIcon,
};

function addAssociatedPRLabel(branchCompareLink: Element, prInfo: PullRequest): void {
	const StateIcon = stateIcon[prInfo.state];
	const state = upperCaseFirst(prInfo.state);

	branchCompareLink.replaceWith(
		<div className="d-inline-block text-right ml-3">
			<a
				data-issue-and-pr-hovercards-enabled
				href={prInfo.url}
				data-hovercard-type="pull_request"
				data-hovercard-url={prInfo.url + '/hovercard'}
			>
				#{prInfo.number}
			</a>
			{' '}
			<span
				className={`State State--${prInfo.state.toLowerCase()} State--small ml-1`}
			>
				<StateIcon width={14} height={14}/> {state}
			</span>
		</div>,
	);
}

async function init(): Promise<Deinit> {
	const associatedPullRequests = await getPullRequestsAssociatedWithBranch();

	return observe('.test-compare-link', {
		add(branchCompareLink) {
			const branchName = branchCompareLink.closest('[branch]')!.getAttribute('branch')!;
			const prInfo = associatedPullRequests[branchName];
			if (prInfo) {
				addAssociatedPRLabel(branchCompareLink, prInfo);
			}
		},
	});
}

void features.add(import.meta.url, {
	asLongAs: [
		pageDetect.isForkedRepo,
	],
	include: [
		pageDetect.isBranches,
	],
	awaitDomReady: false,
	deduplicate: 'has-rgh',
	init,
});
