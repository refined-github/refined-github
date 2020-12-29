
import features from '.';

const nextPageButtonSelectors = [
	'a.next_page', // Issue/PR list, Search
	'.paginate-container > .BtnGroup > :last-child', // Commits
	'.paginate-container > .pagination > :last-child', // Releases
	'.js-notifications-list-paginator-buttons > :last-child' // Notifications
];

const previousPageButtonSelectors = [
	'a.previous_page', // Issue/PR list, Search
	'.paginate-container > .BtnGroup > :first-child', // Commits
	'.paginate-container > .pagination > :first-child', // Releases
	'.js-notifications-list-paginator-buttons > :first-child' // Notifications
];

function init(): void {
	const createNextPageButton = $(nextPageButtonSelectors);
	if (createNextPageButton) {
		createNextPageButton.dataset.hotkey = 'ArrowRight';
	}

	const createPreviousPageButton = $(previousPageButtonSelectors);
	if (createPreviousPageButton) {
		createPreviousPageButton.dataset.hotkey = 'ArrowLeft';
	}
}

void features.add(__filebasename, {
	shortcuts: {
		'→': 'Go to the next page',
		'←': 'Go to the previous page'
	},
	init
});
