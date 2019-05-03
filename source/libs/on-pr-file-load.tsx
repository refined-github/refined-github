// In PRs' Files tab, some files are loaded progressively later.
const handlers = new WeakMap<EventListener, EventListener>();

export default function onPrFileLoad(callback: EventListener): void {
	// When a fragment loads, more fragments might be nested in it. The following code avoids duplicate event handlers.
	const recursiveCallback = handlers.get(callback) || ((event: Event) => {
		callback(event);
		onPrFileLoad(callback);
	});
	handlers.set(callback, recursiveCallback);

	for (const fragment of document.querySelectorAll('include-fragment.diff-progressive-loader')) {
		fragment.addEventListener('load', recursiveCallback);
	}
}
