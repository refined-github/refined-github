import select from 'select-dom';
import {isRepoConversationList, isPRCommit} from 'github-url-detection';

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
		if (isRepoConversationList()) {
			createNextPageButton.dataset.hotkey = 'ArrowRight';
		} else {
			createNextPageButton.dataset.hotkey = 'n';
		}
	}

	const createPreviousPageButton = select(previousPageButtonSelectors);
	if (createPreviousPageButton) {
		if (isRepoConversationList()) {
			createPreviousPageButton.dataset.hotkey = 'ArrowLeft';
		} else {
			createPreviousPageButton.dataset.hotkey = 'p';
		}
	}
}

void features.add(__filebasename, {
	shortcuts: {
		n: 'Go to the next page',
		p: 'Go to the previous page',
	},
	include: [
		// Activate only on pages with pagination
		() => select.exists('.paginate-container'),
	],
	exclude: [
		// Exclude on pull request commit pages because GitHub natively supports it
		isPRCommit,
	],
	init,
});
