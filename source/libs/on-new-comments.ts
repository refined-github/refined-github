import select from 'select-dom';
import debounce from 'debounce-fn';
import observeEl from './simplified-element-observer';

const handlers = new Set<() => void>();
const observed = new WeakSet<HTMLElement>();

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

// Outdated comment are loaded using an include-fragment-element
// This calls the run callback on a successful load of the deferred element
const addOutdatedCommentsListenter = function (discussion) {
	for (const fragment of select.all('details.outdated-comment > include-fragment', discussion)) {
		fragment.addEventListener('load', run);
	}
};

const setup = () => {
	const discussion = select<HTMLElement>('.js-discussion');
	if (!discussion || observed.has(discussion)) {
		return;
	}

	observed.add(discussion);

	// When new comments come in via AJAX
	observeEl(discussion, run);

	// When hidden comments are loaded by clicking "Load more..."
	addListenersOnNewElements();

	// Outdated comments are loaded via a include-fragment element
	addOutdatedCommentsListenter(discussion);
};

export default function (cb) {
	setup();
	handlers.add(cb);
}
