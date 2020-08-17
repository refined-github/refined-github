import select from 'select-dom';

import features from '.';

const nextPageButtonSelectors = [
	'a.next_page', // Issue/PR list, Search
	'.paginate-container > .BtnGroup .btn:last-child', // Commits
	'.paginate-container > .pagination > :last-child' // Releases
];

const previousPageButtonSelectors = [
	'a.previous_page', // Issue/PR list, Search
	'.paginate-container > .BtnGroup .btn:first-child', // Commits
	'.paginate-container > .pagination > :first-child' // Releases
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

void features.add({
	id: __filebasename,
	description: 'Adds shortcuts to navigate through pages with pagination: `←` and `→`.',
	screenshot: false,
	shortcuts: {
		'→': 'Go to the next page',
		'←': 'Go to the previous page'
	}
}, {
	init
});
