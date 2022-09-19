import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';
import {GitPullRequestIcon, IssueOpenedIcon} from '@primer/octicons-react';

import features from '../feature-manager';
import observe from '../helpers/selector-observer';

function addConversationLinks(repositoryLink: HTMLAnchorElement): void {
	const repository = repositoryLink.closest('li')!;

	// Remove the "X issues need help" link
	select('[href*="issues?q=label%3A%22help+wanted"]', repository)?.remove();

	// Place before the "Updated on" element
	select('relative-time', repository)!.previousSibling!.before(
		<a
			className="Link--muted mr-3"
			href={repositoryLink.href + '/issues?q=is%3Aissue+is%3Aopen'}
		>
			<IssueOpenedIcon/>
		</a>,
		<a
			className="Link--muted mr-3"
			href={repositoryLink.href + '/pulls?q=is%3Apr+is%3Aopen'}
		>
			<GitPullRequestIcon/>
		</a>,
	);
}

const selectors = [
	'a[itemprop="name codeRepository"]', // `isUserProfileRepoTab`
	'a[data-hydro-click*=\'"model_name":"Repository"\']', // `isGlobalSearchResults`
] as const;
function init(signal: AbortSignal): void {
	observe(selectors, addConversationLinks, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isUserProfileRepoTab,
		pageDetect.isGlobalSearchResults,
	],
	deduplicate: 'has-rgh',
	init,
});

/*
Test URLs

isUserProfileRepoTab:
https://github.com/fregante?tab=repositories

isGlobalSearchResults:
https://github.com/search?q=fregante
*/
