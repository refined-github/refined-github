import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

const nextPageButtonSelectors = [
	'a.next_page', // Issue/PR list, Search
	'.paginate-container > .BtnGroup > :last-child', // Commits
	'.paginate-container > .pagination > :last-child', // Releases
	'.js-notifications-list-paginator-buttons > :last-child', // Notifications
	'.prh-commit > .BtnGroup > :last-child', // PR Commits
];

const previousPageButtonSelectors = [
	'a.previous_page', // Issue/PR list, Search
	'.paginate-container > .BtnGroup > :first-child', // Commits
	'.paginate-container > .pagination > :first-child', // Releases
	'.js-notifications-list-paginator-buttons > :first-child', // Notifications
	'.prh-commit > .BtnGroup > :first-child', // PR Commits
];

function init(): void {
	const createNextPageButton = select(nextPageButtonSelectors);
	if (createNextPageButton) {
		createNextPageButton.dataset.hotkey = 'ArrowRight';
	}

	const createPreviousPageButton = select(previousPageButtonSelectors);
	if (createPreviousPageButton) {
		createPreviousPageButton.dataset.hotkey = 'ArrowLeft';
	}
}

void features.add(__filebasename, {
	shortcuts: {
		'←': 'Go to the previous page',
		'→': 'Go to the next page',
	}
	include: [
		pageDetect.isConversationList,
		pageDetect.isGlobalSearchResults,
		pageDetect.isLabelList,
		pageDetect.isNotifications,
		pageDetect.isRepoCommitList,
	],
	init,
});
