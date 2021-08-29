import select from 'select-dom';
import {isGlobalConversationList,isPRCommit} from 'github-url-detection';

import features from '.';

const nextPageButtonSelectors = [
	'a.next_page', // Search
	'.paginate-container > .BtnGroup > :last-child', // Commits
	'.paginate-container > .pagination > :last-child', // Releases
	'.js-notifications-list-paginator-buttons > :last-child', // Notifications
	'.prh-commit > .BtnGroup > :last-child', // PR Commits
];

const previousPageButtonSelectors = [
	'a.previous_page', // Search
	'.paginate-container > .BtnGroup > :first-child', // Commits
	'.paginate-container > .pagination > :first-child', // Releases
	'.js-notifications-list-paginator-buttons > :first-child', // Notifications
	'.prh-commit > .BtnGroup > :first-child', // PR Commits
];

function init(): void {
	const createNextPageButton = select(nextPageButtonSelectors);
	if (createNextPageButton) {
		createNextPageButton.dataset.hotkey = 'n';
	}

	const createPreviousPageButton = select(previousPageButtonSelectors);
	if (createPreviousPageButton) {
		createPreviousPageButton.dataset.hotkey = 'p';
	}
}

void features.add(__filebasename, {
	shortcuts: {
		'n': 'Go to the next page',
		'p': 'Go to the previous page',
	},
	exclude: [
		// exclude on issue and pull request lists because the `p` hotkey conflicts with the Projects filter
		isGlobalConversationList,
		// exclude on pull request commit pages because GitHub already supports it natively
		isPRCommit,
	],
	init,
});
