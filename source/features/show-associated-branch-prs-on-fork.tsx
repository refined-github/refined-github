import './show-associated-branch-prs-on-fork.css';
import React from 'dom-chef';
import {CachedFunction} from 'webext-storage-cache';
import * as pageDetect from 'github-url-detection';
import GitMergeIcon from 'octicons-plain-react/GitMerge';
import GitPullRequestIcon from 'octicons-plain-react/GitPullRequest';
import GitPullRequestClosedIcon from 'octicons-plain-react/GitPullRequestClosed';
import GitPullRequestDraftIcon from 'octicons-plain-react/GitPullRequestDraft';

import observe from '../helpers/selector-observer.js';
import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import {cacheByRepo, upperCaseFirst} from '../github-helpers/index.js';
import AssociatedPullRequests from './show-associated-branch-prs-on-fork.gql';

type PullRequest = {
	timelineItems: {
		nodes: AnyObject;
	};
	number: number;
	state: keyof typeof stateIcon;
	isDraft: boolean;
	url: string;
};

export const pullRequestsAssociatedWithBranch = new CachedFunction('associatedBranchPullRequests', {
	async updater(): Promise<Record<string, PullRequest>> {
		const {repository} = await api.v4(AssociatedPullRequests);

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
	},
	maxAge: {hours: 1},
	staleWhileRevalidate: {days: 4},
	cacheKey: cacheByRepo,
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

function addAssociatedPRLabelNew(parent: Element, prInfo: PullRequest): void {
	const StateIcon = stateIcon[prInfo.state];

	parent.append(
		<div className="rgh-pr-box">
			<a
				href={prInfo.url}
				target="_blank"
				data-hovercard-url={prInfo.url + '/hovercard'}
				aria-label={`Link to the ${prInfo.isDraft ? 'draft ' : ''}pull request #${prInfo.number}`}
				className="rgh-pr-link" rel="noreferrer"
			>
				<span className="rgh-pr-label">
					<div data-testid="draft-pull-request-icon" className="rgh-pr-box">
						<StateIcon width={14} height={14} className={'rgh-pr-' + prInfo.state.toLowerCase()}/>
					</div>
					<span className="rgh-pr-text">#{prInfo.number}</span>
				</span>
			</a>
		</div>,
	);
}

async function addLink(branchCompareLink: Element): Promise<void> {
	const prs = await pullRequestsAssociatedWithBranch.get();
	const branchName = branchCompareLink.closest('[branch]')!.getAttribute('branch')!;
	const prInfo = prs[branchName];
	if (prInfo) {
		addAssociatedPRLabel(branchCompareLink, prInfo);
	}
}

async function addLinkNew(titleDiv: HTMLDivElement): Promise<void> {
	const prs = await pullRequestsAssociatedWithBranch.get();
	const branchName = titleDiv.getAttribute('title')!;
	const prInfo = prs[branchName];
	if (!prInfo) {
		return;
	}

	const tableRow = titleDiv.closest('tr.TableRow')!;
	const prCell = tableRow.children.item(4) as HTMLTableCellElement;
	addAssociatedPRLabelNew(prCell, prInfo);
}

function init(signal: AbortSignal): void {
	observe('.test-compare-link', addLink, {signal});
	observe('react-app[app-name=repos-branches] table.Table tbody.TableBody a[class^=BranchName-] div[title]', addLinkNew, {signal});
}

void features.add(import.meta.url, {
	asLongAs: [
		pageDetect.isForkedRepo,
	],
	include: [
		pageDetect.isBranches,
	],
	init,
});

/*

Test URLs:

https://github.com/pnarielwala/create-react-app-ts/branches

*/
