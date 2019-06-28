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

export async function observeOneMutation(element: Element, options: MutationObserverInit = {
	childList: true,
	subtree: true
}): Promise<MutationRecord> {
	return new Promise(resolve => {
		new MutationObserver(([change], observer) => {
			observer.disconnect();
			resolve(change);
		}).observe(element, options);
	});
}
