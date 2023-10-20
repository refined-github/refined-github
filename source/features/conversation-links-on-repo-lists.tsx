import React from 'dom-chef';
import {$} from 'select-dom';
import * as pageDetect from 'github-url-detection';
import {GitPullRequestIcon, IssueOpenedIcon} from '@primer/octicons-react';

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
		<a
			className="Link--muted mr-3"
			href={repositoryLink.href + '/issues'}
		>
			<IssueOpenedIcon/>
		</a>,
		<a
			className="Link--muted mr-3"
			href={repositoryLink.href + '/pulls'}
		>
			<GitPullRequestIcon/>
		</a>,
	);
}

const selectors = [
	'a[itemprop="name codeRepository"]', // `isProfileRepoList`
	'.repo-list-item .f4 a', // `isGlobalSearchResults`
] as const;
function init(signal: AbortSignal): void {
	observe(selectors, addConversationLinks, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isProfileRepoList,
		() => pageDetect.isGlobalSearchResults() && new URLSearchParams(location.search).get('type') === 'repositories',
	],
	init,
});

/*
Test URLs

isProfileRepoList:
https://github.com/fregante?tab=repositories

isGlobalSearchResults:
https://github.com/search?q=fregante
*/
