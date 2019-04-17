export default function (el: Node|string, listener: MutationCallback, options: MutationObserverInit = {childList: true}) {
	if (typeof el === 'string') {
		el = document.querySelector(el)!;
	}

	if (!el) {
		return;
	}

	// Run on updates
	const observer = new MutationObserver(listener);
	observer.observe(el, options);

	// Run the first time
	listener.call(observer, [], observer);

	return observer;
}
