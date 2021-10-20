import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

const nextPageButtonSelectors = [
	'a.next_page', // Issue/PR list, Search
	'.paginate-container.BtnGroup > :last-child', // Notifications
	'.paginate-container > .BtnGroup > :last-child', // Commits
	'.paginate-container > .pagination > :last-child', // Releases
	'.prh-commit > .BtnGroup > :last-child', // PR Commits
];

const previousPageButtonSelectors = [
	'a.previous_page', // Issue/PR list, Search
	'.paginate-container.BtnGroup > :first-child', // Notifications
	'.paginate-container > .BtnGroup > :first-child', // Commits
	'.paginate-container > .pagination > :first-child', // Releases
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
		'→': 'Go to the next page',
		'←': 'Go to the previous page',
	},
	// TODO: enable for isDiscussionList after #4695 is fixed
	include: [
		pageDetect.isConversationList,
		pageDetect.isGlobalSearchResults,
		pageDetect.isLabelList,
		pageDetect.isNotifications,
		pageDetect.isRepoCommitList,
		pageDetect.isPRCommit,
		pageDetect.isUserProfileRepoTab,
	],
	deduplicate: false,
	init,
});
