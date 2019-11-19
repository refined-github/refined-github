import select from 'select-dom';
import observeEl from './simplified-element-observer';

const handlers = new Set<VoidFunction>();
const observed = new WeakSet();

function run(): void {
	// Run all callbacks without letting an error stop the loop and without silencing it
	handlers.forEach(async callback => callback());
}

// On new page loads, run the callbacks and look for the new elements.
// (addEventListener doesn't add duplicate listeners)
function addListenersOnNewElements(): void {
	for (const loadMore of select.all('.js-ajax-pagination')) {
		loadMore.addEventListener('page:loaded', run);
		loadMore.addEventListener('page:loaded', addListenersOnNewElements);
	}

	// Outdated comment are loaded later using an include-fragment element
	for (const fragment of select.all('details.outdated-comment > include-fragment')) {
		fragment.addEventListener('load', run);
	}
}

function setup(): void {
	const discussion = select('.js-discussion');
	if (!discussion || observed.has(discussion)) {
		return;
	}

	observed.add(discussion);

	// When new comments come in via AJAX
	observeEl(discussion, run);

	// When hidden comments are loaded by clicking "Load more..."
	addListenersOnNewElements();
}

export default function (callback: VoidFunction): void {
	setup();
	handlers.add(callback);
}
