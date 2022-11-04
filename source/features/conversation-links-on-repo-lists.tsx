import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';
import {GitPullRequestIcon, IssueOpenedIcon} from '@primer/octicons-react';

import features from '../feature-manager';
import observe from '../helpers/selector-observer';
import {assertNodeContent} from '../helpers/dom-utils';

function addConversationLinks(repositoryLink: HTMLAnchorElement): void {
	const repository = repositoryLink.closest('li')!;

	// Remove the "X issues need help" link
	select('[href*="issues?q=label%3A%22help+wanted"]', repository)?.remove();

	// Place before the update date
	assertNodeContent(
		select('relative-time', repository)!.previousSibling,
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
	'a[itemprop="name codeRepository"]', // `isUserProfileRepoTab`
	'.repo-list-item .f4 a', // `isGlobalSearchResults`
] as const;
function init(signal: AbortSignal): void {
	observe(selectors, addConversationLinks, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isUserProfileRepoTab,
		() => pageDetect.isGlobalSearchResults() && new URLSearchParams(location.search).get('type') === 'repositories',
	],
	awaitDomReady: false,
	init,
});

/*
Test URLs

isUserProfileRepoTab:
https://github.com/fregante?tab=repositories

isGlobalSearchResults:
https://github.com/search?q=fregante
*/
