import React from 'dom-chef';
import select from 'select-dom';
import * as api from '../libs/api';
import features from '../libs/features';
import {isRepoWithAccess} from '../libs/page-detect';
import {getUsername} from '../libs/utils';

function findForkedRepo(): string | undefined {
	const forkSourceElement = select<HTMLAnchorElement>('.fork-flag a');
	if (forkSourceElement) {
		return forkSourceElement.pathname.slice(1);
	}

	return undefined;
}

interface SearchResponse {
	issueCount: number;
	edges: Array<{
		node: {
			url: string;
		};
	}>;
}

function getUserPullRequestsURL(forkedRepo: string, user: string): string {
	return `https://github.com/${forkedRepo}/pulls?q=is%3Apr+is%3Aopen+sort%3Aupdated-desc+author%3A${user}`;
}

async function getOpenPullRequestsData(): Promise<void | SearchResponse> {
	if (!isRepoWithAccess()) {
		return;
	}

	const forkedRepo = findForkedRepo();

	if (!forkedRepo) {
		return;
	}

	const user = getUsername();

	// Grab the PR count and the first PR's URL
	// This allows to link to the PR directly if only one is found
	const {search} = await api.v4(`
		search(type: ISSUE, query: "repo:${forkedRepo} is:pr is:open author:${user}", first: 1) {
			issueCount
			edges {
				node {
					... on PullRequest {
						url
					}
				}
			}
		}
	`);

	if (search.issueCount === 0) {
		return;
	}

	return search;
}

async function initHeadHint(): Promise<void | false> {
	const result = await getOpenPullRequestsData();

	if (!result) {
		return;
	}

	const forkedRepo = findForkedRepo()!;
	const user = getUsername();

	const count: number = result.issueCount;
	const textContainer = select('.fork-flag .text')!;

	if (count === 1) {
		textContainer.append(
			<> with <a href={result.edges[0].node.url}>one open pull request</a></>
		);
	} else {
		const pullRequestsURL = getUserPullRequestsURL(forkedRepo, user);

		textContainer.append(
			<> with <a href={pullRequestsURL}>{count} open pull requests</a></>
		);
	}
}

async function initDeleteHint(): Promise<void | false> {
	const result = await getOpenPullRequestsData();

	if (!result) {
		return;
	}

	const forkedRepo = findForkedRepo()!;
	const user = getUsername();
	const pullRequestsCount: number = result.issueCount;

	const deleteDialogParagraph = select('details-dialog[aria-label*="Delete"] .Box-body p:first-child');
	if (!deleteDialogParagraph) {
		return;
	}

	const pullRequestsLink = pullRequestsCount === 1 ?
		<a href={result.edges[0].node.url}>your open pull request</a> :
		<a href={getUserPullRequestsURL(forkedRepo, user)}>your {pullRequestsCount} open pull requests</a>;

	deleteDialogParagraph.after(
		<p>
			It will also abandon {pullRequestsLink} in <strong>{forkedRepo}</strong> and
			you&apos;ll no longer be able to edit {pullRequestsCount === 1 ? 'it' : 'them'}.
		</p>
	);
}

features.add({
	id: __featureName__,
	description: 'In your forked repos, shows number of your open PRs to the original repo.',
	screenshot: 'https://user-images.githubusercontent.com/1922624/76398271-e0648500-637c-11ea-8210-53dda1be9d51.png',
	include: [
		features.isRepo
	],
	load: features.nowAndOnAjaxedPages,
	init: initHeadHint
});

features.add({
	id: __featureName__,
	description: 'Add a warning about open outgoing PRs when you\'re about to delete a repo.',
	screenshot: 'https://user-images.githubusercontent.com/1922624/76398603-726c8d80-637d-11ea-95ca-fdf493302195.png',
	include: [
		features.isRepoSettings
	],
	load: features.nowAndOnAjaxedPages,
	init: initDeleteHint
});
