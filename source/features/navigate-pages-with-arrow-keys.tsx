import select from 'select-dom';
import features from '../libs/features';

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

features.add({
	id: __featureName__,
	description: 'Adds shortcuts to navigate through pages with pagination: `←` and `→`.',
	screenshot: false,
	load: features.onAjaxedPages,
	shortcuts: {
		'→': 'Go to the next page',
		'←': 'Go to the previous page'
	},
	init
});
