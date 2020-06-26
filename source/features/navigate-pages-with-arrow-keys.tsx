import select from 'select-dom';

import features from '.';

function init(): void {
	const createNextPageButton = select('a.next_page');
	if (createNextPageButton) {
		createNextPageButton.dataset.hotkey = 'ArrowRight';
	}

	const createPreviousPageButton = select('a.previous_page');
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
