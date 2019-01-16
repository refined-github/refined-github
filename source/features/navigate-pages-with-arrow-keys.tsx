import select from 'select-dom';
import features from '../libs/features';
import {registerShortcut} from './improve-shortcut-help';

function init() {
	registerShortcut('site', 'ArrowRight', 'Go to the next page.');
	const createNextPageButton = select('a.next_page');
	if (createNextPageButton) {
		createNextPageButton.setAttribute('data-hotkey', 'ArrowRight');
	}
	registerShortcut('site', 'ArrowLeft', 'Go to the previous page.');
	const createPreviousPageButton = select('a.previous_page');
	if (createPreviousPageButton) {
		createPreviousPageButton.setAttribute('data-hotkey', 'ArrowLeft');
	}
}

features.add({
	id: 'navigate-pages-with-arrow-keys',
	load: features.onAjaxedPages,
	init
});
