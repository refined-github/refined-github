import React from 'dom-chef';
import cache from 'webext-storage-cache';
import onetime from 'onetime';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';
import {GitMergeIcon, GitPullRequestIcon} from '@primer/octicons-react';

import features from '.';
import * as api from '../github-helpers/api';
import {getRepo, upperCaseFirst} from '../github-helpers';

interface PullRequest {
	number: number;
	state: 'Open' | 'Closed' | 'Merged' | 'Draft';
	isDraft: boolean;
	url: string;
}

const getPullRequestsAssociatedWithBranch = cache.function(async (): Promise<Record<string, PullRequest>> => {
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
	maxAge: {hours: 1},
	staleWhileRevalidate: {days: 4},
	cacheKey: () => 'associatedBranchPullRequests:' + getRepo()!.nameWithOwner
});

const stateClass = {
	Open: '--green',
	Closed: '--red',
	Merged: '--purple',
	Draft: ''
};

async function init(): Promise<void> {
	const associatedPullRequests = await getPullRequestsAssociatedWithBranch();

	observe('.test-compare-link', {
		add(branchCompareLink) {
			const branchName = branchCompareLink.closest('[branch]')!.getAttribute('branch')!;
			const prInfo = associatedPullRequests[branchName];
			if (prInfo) {
				const StateIcon = prInfo.state === 'Merged' ? GitMergeIcon : GitPullRequestIcon;

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
	});
}

void features.add(__filebasename, {
	include: [
		pageDetect.isBranches
	],
	exclude: [
		() => !pageDetect.isForkedRepo()
	],
	awaitDomReady: false,
	init: onetime(init)
});
