import React from 'dom-chef';
import select from 'select-dom';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';
import {GitPullRequestIcon, IssueOpenedIcon} from '@primer/octicons-react';

import features from '.';

function addConversationLinks(repositoryLink: HTMLAnchorElement): void {
	repositoryLink.classList.add('rgh-discussion-links');
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

function init(): Deinit {
	return observe([
		'[itemprop="name codeRepository"]:not(.rgh-discussion-links)', // `isUserProfileRepoTab`
		'[data-hydro-click*=\'"model_name":"Repository"\']:not(.rgh-discussion-links)', // `isGlobalSearchResults`
	].join(','), {
		constructor: HTMLAnchorElement,
		add: addConversationLinks,
	});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isUserProfileRepoTab,
		pageDetect.isGlobalSearchResults,
	],
	init,
});
