import once from 'onetime';
import select from 'select-dom';
import debounce from 'debounce-fn';
import observeEl from './simplified-element-observer';

const handlers = new Set();

const run = debounce(() => {
	// Safely run all callbacks
	handlers.forEach(async cb => cb());
}, {wait: 200});

// On new page loads, run the callbacks and look for the new elements.
// (addEventListener doesn't add duplicate listeners)
const addListenersOnNewElements = debounce(() => {
	for (const loadMore of select.all('.js-ajax-pagination')) {
		loadMore.addEventListener('page:loaded', run);
		loadMore.addEventListener('page:loaded', addListenersOnNewElements);
	}
}, {wait: 50});

const setup = once(() => {
	// When new comments come in via AJAX
	observeEl('.js-discussion', run);

	// When hidden comments are loaded by clicking "Load more..."
	addListenersOnNewElements();
});

export default function (cb) {
	handlers.add(cb);
	setup();
}
