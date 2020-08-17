import select from 'select-dom';

import features from '.';

const nextPageButtonSelectors = [
	/*  Issue/PR list, Search */
	'a.next_page',
	/* Commits */
	'.paginate-container > .BtnGroup .btn:last-child',
	/* Releases */
	'.paginate-container > .pagination > *:last-child'
];

const previousPageButtonSelectors = [
	/*  Issue/PR list, Search */
	'a.previous_page',
	/* Commits */
	'.paginate-container > .BtnGroup .btn:first-child',
	/* Releases */
	'.paginate-container > .pagination > *:first-child'
];

function init(): void {
	const createNextPageButton = select(nextPageButtonSelectors.join(' , '));
	if (createNextPageButton) {
		createNextPageButton.dataset.hotkey = 'ArrowRight';
	}

	const createPreviousPageButton = select(previousPageButtonSelectors.join(' , '));
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
