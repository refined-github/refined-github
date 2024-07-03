import React from 'dom-chef';
import {$} from 'select-dom';
import * as pageDetect from 'github-url-detection';
import GitPullRequestIcon from 'octicons-plain-react/GitPullRequest';
import IssueOpenedIcon from 'octicons-plain-react/IssueOpened';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import {assertNodeContent} from '../helpers/dom-utils.js';

function addConversationLinks(repositoryLink: HTMLAnchorElement): void {
	const repository = repositoryLink.closest('li')!;

	// Remove the "X issues need help" link
	$('[href*="issues?q=label%3A%22help+wanted"]', repository)?.remove();

	// Place before the update date
	assertNodeContent(
		$('relative-time', repository)!.previousSibling,
		'Updated',
	).before(
		<>
			<a
				className="Link--muted mr-3"
				href={repositoryLink.href + '/issues'}
			>
				<IssueOpenedIcon/>
			</a>
			<a
				className="Link--muted mr-3"
				href={repositoryLink.href + '/pulls'}
			>
				<GitPullRequestIcon/>
			</a>
		</>,
	);
}

function addSearchConversationLinks(repositoryLink: HTMLAnchorElement): void {
	if (new URLSearchParams(location.search).get('type') !== 'repositories') return
	// Place before the update date ·
	repositoryLink
		.closest('[data-testid="results-list"] > div')!
		.querySelector('ul > span:last-of-type')!
		.before(
			<>
				<span
					aria-hidden="true"
					className="color-fg-muted mx-2"
				>
					·
				</span>
				<li className="d-flex text-small">
					<a
						className="Link--muted"
						href={repositoryLink.href + '/issues'}
					>
						<IssueOpenedIcon/>
					</a>
				</li>
				<li className="d-flex text-small ml-2">
					<a
						className="Link--muted"
						href={repositoryLink.href + '/pulls'}
					>
						<GitPullRequestIcon/>
					</a>
				</li>
			</>,
		);
}

function init(signal: AbortSignal): void {
	observe('a[itemprop="name codeRepository"]', addConversationLinks, {signal});
}

function initSearch(signal: AbortSignal): void {
	observe('.search-title a', addSearchConversationLinks, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isUserProfileRepoTab, // Organizations already have these links
	],
	init,
}, {
	include: [
		pageDetect.isGlobalSearchResults,
	],
	init: initSearch,
});

/*
Test URLs

isProfileRepoList:
https://github.com/fregante?tab=repositories

isGlobalSearchResults:
https://github.com/search?q=fregante
*/
