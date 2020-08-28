import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import {observe} from 'selector-observer';
import IssueIcon from 'octicon/issue-opened.svg';
import * as pageDetect from 'github-url-detection';
import PullRequestIcon from 'octicon/git-pull-request.svg';

import features from '.';

function init(): void {
	observe([
		'[itemprop="name codeRepository"]:not(.rgh-discussion-links)', // `isUserProfileRepoTab`
		'[data-hydro-click*=\'"model_name":"Repository"\']' // `isGlobalSearchResults`
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
					<IssueIcon/>
				</a>,
				<a
					className="muted-link mr-3"
					href={repositoryLink.href + '/pulls?q=is%3Apr+is%3Aopen'}
				>
					<PullRequestIcon/>
				</a>
			);
		}
	});
}

void features.add({
	id: __filebasename,
	description: 'Adds a link to the issues and pulls on the user profile repository tab and global search.',
	screenshot: 'https://user-images.githubusercontent.com/16872793/78712349-82c54900-78e6-11ea-8328-3c2d39a78862.png'
}, {
	include: [
		pageDetect.isUserProfileRepoTab,
		pageDetect.isGlobalSearchResults,
		pageDetect.isUserProfileRepoTab
	],
	waitForDomReady: false,
	init: onetime(init)
});
