import React from 'dom-chef';
import select from 'select-dom';
import {
	IssueOpenedIcon,
	GitPullRequestIcon
} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import features from '.';
import observeElement from '../helpers/simplified-element-observer';

function init(): void {
	const repositories = select.all<HTMLAnchorElement>([
		'[itemprop="name codeRepository"]:not(.rgh-discussion-links)', // `isUserProfileRepoTab`
		'[data-hydro-click*=\'"model_name":"Repository"\']' // `isGlobalSearchResults`
	]);

	for (const repositoryLink of repositories) {
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
}

void features.add({
	id: __filebasename,
	description: 'Adds a link to the issues and pulls on the user profile repository tab and global search.',
	screenshot: 'https://user-images.githubusercontent.com/16872793/78712349-82c54900-78e6-11ea-8328-3c2d39a78862.png'
}, {
	include: [
		pageDetect.isUserProfileRepoTab,
		pageDetect.isGlobalSearchResults
	],
	init
}, {
	include: [
		pageDetect.isUserProfileRepoTab
	],
	init() {
		observeElement('#user-repositories-list', init);
		return false;
	}
});
