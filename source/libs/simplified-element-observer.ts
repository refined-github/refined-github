export default function observeEl(el: Node|string, listener: MutationCallback, options: MutationObserverInit = {childList: true}): MutationObserver | undefined {
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

export async function observeOneMutation(element: Element, options: MutationObserverInit = {childList: true}): Promise<void> {
	return new Promise(resolve => {
		new MutationObserver((_, observer) => {
			observer.disconnect();
			resolve();
		}).observe(element, options);
	})
}
