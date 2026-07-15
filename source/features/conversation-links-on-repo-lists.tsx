import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import GitPullRequestIcon from 'octicons-plain-react/GitPullRequest';
import IssueOpenedIcon from 'octicons-plain-react/IssueOpened';
import {$, $optional, closestElement} from 'select-dom';

import features from '../feature-manager.js';
import {assertNodeContent} from '../helpers/dom-utils.js';
import observe from '../helpers/selector-observer.js';

function addConversationLinks(repositoryLink: HTMLAnchorElement): void {
	const repository = closestElement('li', repositoryLink);

	// Remove the "X issues need help" link
	$optional('[href*="issues?q=label%3A%22help+wanted"]', repository)?.remove();

	// Place before the update date
	assertNodeContent(
		$('relative-time', repository).previousSibling,
		'Updated',
	).before(
		<a
			className="Link--muted mr-3 tmp-mr-3"
			href={repositoryLink.href + '/issues'}
		>
			<IssueOpenedIcon />
		</a>,
		<a
			className="Link--muted mr-3 tmp-mr-3"
			href={repositoryLink.href + '/pulls'}
		>
			<GitPullRequestIcon />
		</a>,
	);
}

function addSearchConversationLinks(stargazersLink: HTMLAnchorElement): void {
	closestElement('li', stargazersLink).after(
		<span
			aria-hidden="true"
			className="color-fg-muted mx-2 tmp-mx-2"
		>
			·
		</span>,
		<li className="d-flex text-small">
			<a
				className="Link--muted"
				href={stargazersLink.href + '/issues'}
			>
				<IssueOpenedIcon />
			</a>
		</li>,
		<li className="d-flex text-small ml-2 tmp-ml-2">
			<a
				className="Link--muted"
				href={stargazersLink.href + '/pulls'}
			>
				<GitPullRequestIcon />
			</a>
		</li>,
	);
}

function init(signal: AbortSignal): void {
	observe('a[itemprop="name codeRepository"]', addConversationLinks, {signal});
}

function initSearch(signal: AbortSignal): void {
	observe('a[class^="Repositories-module__stargazersLink"]', addSearchConversationLinks, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isUserProfileRepoTab, // Organizations already have these links
	],
	init,
}, {
	asLongAs: [
		pageDetect.isGlobalSearchResults,
		() => new URLSearchParams(location.search).get('type') === 'repositories',
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
