export default function (el, listener, options = {childList: true}) {
	if (typeof el === 'string') {
		el = document.querySelector(el);
	}

	if (!el) {
		return;
	}

	// Run first
	listener([]);

	// Run on updates
	const observer = new MutationObserver(listener);
	observer.observe(el, options);
	return observer;
}
