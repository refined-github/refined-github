import select from 'select-dom';

// In PRs' Files tab, some files are loaded progressively later.
const handlers = new WeakMap<EventListener, EventListener>();

export default function onPrFileLoad(callback: EventListener): void {
	// When a fragment loads, more fragments might be nested in it. The following code avoids duplicate event handlers.
	const recursiveCallback = handlers.get(callback) || ((event: Event) => {
		callback(event);
		onPrFileLoad(callback);
	});
	handlers.set(callback, recursiveCallback);

	const fragments = select.all([
		'include-fragment.diff-progressive-loader', // Incremental file loader on scroll
		'include-fragment.js-diff-entry-loader' // File diff loader on clicking "Load Diff"
	].join());

	for (const fragment of fragments) {
		fragment.addEventListener('load', recursiveCallback);
	}
}
