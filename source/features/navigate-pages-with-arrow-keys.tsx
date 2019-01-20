import select from 'select-dom';
import features from '../libs/features';

function init() {
	const createNextPageButton = select('a.next_page');
	if (createNextPageButton) {
		createNextPageButton.setAttribute('data-hotkey', 'ArrowRight');
	}

	const createPreviousPageButton = select('a.previous_page');
	if (createPreviousPageButton) {
		createPreviousPageButton.setAttribute('data-hotkey', 'ArrowLeft');
	}
}

features.add({
	id: 'navigate-pages-with-arrow-keys',
	load: features.onAjaxedPages,
	shortcuts: {
		'→': 'Go to the next page',
		'←': 'Go to the previous page'
	},
	init
});
