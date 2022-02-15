/* eslint-disable unicorn/no-object-as-default-parameter -- We want to replace the whole default object, not just part of it */

export default function observeElement(
	element: Node | string,
	listener: MutationCallback,
	options: MutationObserverInit & {signal?: AbortSignal} = {childList: true},
): MutationObserver | undefined {
	if (options.signal?.aborted) {
		return;
	}

	if (typeof element === 'string') {
		element = document.querySelector(element)!;
	}

	// Run on updates
	const observer = new MutationObserver(listener);
	observer.observe(element, options);
	if (options.signal) {
		options.signal.addEventListener('abort', observer.disconnect, {once: true});
	}

	// Run the first time
	listener.call(observer, [], observer);

	return observer;
}
