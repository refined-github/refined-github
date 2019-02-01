export default function (element: Element | string, listener: MutationCallback, options: MutationObserverInit = {childList: true}) {
	if (typeof element === 'string') {
		element = document.querySelector(element);
	}

	if (!element) {
		return;
	}

	// Run on updates
	const observer = new MutationObserver(listener);
	observer.observe(element, options);

	// Run the first time
	listener.call(observer, []);

	return observer;
}
