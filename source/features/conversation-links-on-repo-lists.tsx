import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';
import {GitPullRequestIcon, IssueOpenedIcon} from '@primer/octicons-react';

import features from '.';

function init(): void {
	observe([
		'[itemprop="name codeRepository"]:not(.rgh-discussion-links)', // `isUserProfileRepoTab`
		'[data-hydro-click*=\'"model_name":"Repository"\']:not(.rgh-discussion-links)' // `isGlobalSearchResults`
	].join(), {
		constructor: HTMLAnchorElement,
		add(repositoryLink) {
			repositoryLink.classList.add('rgh-discussion-links');
			const repository = repositoryLink.closest('li')!;

			// Remove the "X issues need help" link
			select('[href*="issues?q=label%3A%22help+wanted"]', repository)?.remove();

			// Place before the "Updated on" element
			select('relative-time', repository)!.previousSibling!.before(
				<a
					className="muted-link mr-3"
					href={repositoryLink.href + '/issues?q=is%3Aissue+is%3Aopen'}
				>
					<IssueOpenedIcon/>
				</a>,
				<a
					className="muted-link mr-3"
					href={repositoryLink.href + '/pulls?q=is%3Apr+is%3Aopen'}
				>
					<GitPullRequestIcon/>
				</a>
			);
		}
	});
}

void features.add(__filebasename, {
	include: [
		pageDetect.isUserProfileRepoTab,
		pageDetect.isGlobalSearchResults
	],
	init: onetime(init)
});
