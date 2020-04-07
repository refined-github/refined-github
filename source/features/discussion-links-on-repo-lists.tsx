import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import issueIcon from 'octicon/issue-opened.svg';
import pullRequestIcon from 'octicon/git-pull-request.svg';
import observeElement from '../libs/simplified-element-observer';

function init(): void {
	const repositories = select.all<HTMLAnchorElement>([
			'[itemprop="name codeRepository"]', // `isUserProfileRepoTab`
			'[data-hydro-click*=\'"model_name":"Repository"\']' // `isGlobalSearchResults`
	]);
	for (const repositoryLink of repositories) {
		const repository = repositoryLink.closest('li');
		repository.classList.add('rgh-discussion-links');
		// Remove the help wanted issues
		select('[href*="issues?q=label%3A%22help+wanted%"]', repository)?.remove();

		const repositoryUrl = select<HTMLAnchorElement>('[itemprop="name codeRepository"], [data-hydro-click*="search_result.click"][href]', repository)!.href;
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
	description: 'Adds a link to the issues and pulls on the user profile repository tab and global search.',
	screenshot: 'https://user-images.githubusercontent.com/16872793/78712349-82c54900-78e6-11ea-8328-3c2d39a78862.png'
}, {
	include: [
		features.isUserProfileRepoTab,
		features.isGlobalSearchResults
	],
	load: features.onAjaxedPages,
	init
}, {
	include: [
		features.isUserProfileRepoTab
	],
	load: features.onAjaxedPages,
	init: () => observeElement('#user-repositories-list', init)
});
