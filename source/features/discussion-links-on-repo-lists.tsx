import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import issueIcon from 'octicon/issue-opened.svg';
import pullRequestIcon from 'octicon/git-pull-request.svg';

async function init(): Promise<false | void> {
	if (!select.exists('[data-filterable-for="your-repos-filter"]')) {
		return;
	}

	for (const repository of select.all('[itemprop="owns"]')) {
		// Remove the help wanted issues
		select('[href*="issues?q=label%3A%22help+wanted%"]', repository)?.remove();

		const repositoryUrl = select<HTMLAnchorElement>('[itemprop="name codeRepository"]')!.href;
		// Need to use previousSibling since the updated text is not in an element
		select('relative-time', repository)!.previousSibling!.before(
			<a
				className="muted-link mr-3"
				href={repositoryUrl + '/issues?q=is%3Aissue+is%3Aopen'}
			>
				{issueIcon()}
			</a>,
			<a
				className="muted-link mr-3"
				href={repositoryUrl + '/pulls?q=is%3Aissue+is%3Aopen'}
			>
				{pullRequestIcon()}
			</a>
		);
	}
}

features.add({
	id: __featureName__,
	description: 'Adds a link to the issues and pull on the user profile repository tab.',
	screenshot: 'https://user-images.githubusercontent.com/16872793/78670305-8ab3c780-78ab-11ea-9c17-4d07f124192e.png'
}, {
	include: [
		features.isUserProfile
	],
	exclude: [
		features.isOrganizationProfile
	],
	load: features.onAjaxedPages,
	init
});
