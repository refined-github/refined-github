/* eslint-disable unicorn/no-object-as-default-parameter -- We want to replace the whole default object, not just part of it */

export default function observeElement(
	element: Node | string,
	listener: MutationCallback,
	options: MutationObserverInit = {childList: true}
): MutationObserver | undefined {
	if (typeof element === 'string') {
		element = document.querySelector(element)!;
	}

	// Run on updates
	const observer = new MutationObserver(listener);
	observer.observe(element, options);

	// Run the first time
	listener.call(observer, [], observer);

	return observer;
}

export async function observeOneMutation(
	element: Element,
	options: MutationObserverInit = {
		childList: true,
		subtree: true
	}
): Promise<MutationRecord> {
	return new Promise(resolve => {
		new MutationObserver(([change], observer) => {
			observer.disconnect();
			resolve(change);
		}).observe(element, options);
	});
}
