import mem from 'mem';
import delegate from 'delegate-it';

const fragmentSelector = [
	'include-fragment.diff-progressive-loader', // Incremental file loader on scroll
	'include-fragment.js-diff-entry-loader' // File diff loader on clicking "Load Diff"
].join();

// This lets you call `onPrFileLoad` multiple times with the same callback but only ever a `load` listener is registered
const getDeduplicatedHandler = mem((callback: EventListener): delegate.EventHandler => {
	return (event: delegate.Event) => {
		event.delegateTarget.addEventListener('load', callback);
	};
});

export default function onPrFileLoad(callback: EventListener): delegate.Subscription {
	// `loadstart` is fired when the fragment is still attached so event delegation works.
	// `load` is fired after it’s detached, so `delegate` would never listen to it.
	// This is why we listen to a global `loadstart` and then add a specific `load` listener on the element, which is fired even when the element is detached.
	return delegate(document, fragmentSelector, 'loadstart', getDeduplicatedHandler(callback), true);
}
