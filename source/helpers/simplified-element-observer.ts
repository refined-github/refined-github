/* eslint-disable unicorn/no-object-as-default-parameter -- We want to replace the whole default object, not just part of it */

/** @deprecated Only here for `wait-for-checks` */
export default function observeElement(
	element: Node | string,
	listener: MutationCallback,
	options: MutationObserverInit = {childList: true},
): MutationObserver {
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
