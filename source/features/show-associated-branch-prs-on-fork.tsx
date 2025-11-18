import './show-associated-branch-prs-on-fork.css';

import React from 'dom-chef';
import {CachedFunction} from 'webext-storage-cache';
import * as pageDetect from 'github-url-detection';
import GitMergeIcon from 'octicons-plain-react/GitMerge';
import GitPullRequestIcon from 'octicons-plain-react/GitPullRequest';
import GitPullRequestClosedIcon from 'octicons-plain-react/GitPullRequestClosed';
import GitPullRequestDraftIcon from 'octicons-plain-react/GitPullRequestDraft';
import RepoForkedIcon from 'octicons-plain-react/RepoForked';
import memoize from 'memoize';

import observe from '../helpers/selector-observer.js';
import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import {cacheByRepo} from '../github-helpers/index.js';
import AssociatedPullRequests from './show-associated-branch-prs-on-fork.gql';
import {expectToken} from '../github-helpers/github-token.js';

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

async function addLink(branch: HTMLElement): Promise<void> {
	const prs = await pullRequestsAssociatedWithBranch.get();
	const branchName = branch.getAttribute('title')!;
	const prInfo = prs[branchName];
	if (!prInfo) {
		return;
	}

	const StateIcon = stateIcon[prInfo.state] ?? (() => {/* empty */});
	const stateClassName = prInfo.state.toLowerCase();

	const cell = branch
		.closest('tr.TableRow')!
		.children
		.item(4)!;

	cell.classList.add('rgh-pr-cell');
	cell.append(
		<div className="rgh-pr-box">
			<a
				href={prInfo.url}
				target="_blank" // Matches native behavior
				data-hovercard-url={prInfo.url + '/hovercard'}
				aria-label={`Link to the ${prInfo.isDraft ? 'draft ' : ''}pull request #${prInfo.number}`}
				className="rgh-pr-link"
				rel="noreferrer"
			>
				<StateIcon width={14} height={14} className={stateClassName} />
				<RepoForkedIcon width={14} height={14} className={`mr-1 ${stateClassName}`} />
				#{prInfo.number}
			</a>
		</div>,
	);
}

async function init(signal: AbortSignal): Promise<void> {
	await expectToken();
	// Memoize because it's being called twice for each. Ideally this should be part of the selector observer
	// https://github.com/refined-github/refined-github/pull/7194#issuecomment-1894972091
	observe('react-app[app-name=repos-branches] a[class*=BranchName] div[title]', memoize(addLink), {signal});
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

https://github.com/bfred-it-org/github-sandbox/branches

*/
