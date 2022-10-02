import mem from 'mem';
import delegate, {DelegateEvent, DelegateEventHandler} from 'delegate-it';

// This lets you call `onDiffFileLoad` multiple times with the same callback but only ever a `load` listener is registered
const getDeduplicatedHandler = mem((callback: EventListener): DelegateEventHandler => (event: DelegateEvent) => {
	event.delegateTarget.addEventListener('load', callback);
});

function createFragmentLoadListener(fragmentSelector: string, callback: EventListener, signal: AbortSignal): void {
	// `loadstart` is fired when the fragment is still attached so event delegation works.
	// `load` is fired after it’s detached, so `delegate` would never listen to it.
	// This is why we listen to a global `loadstart` and then add a specific `load` listener on the element, which is fired even when the element is detached.
	delegate(document, fragmentSelector, 'loadstart', getDeduplicatedHandler(callback), {capture: true, signal});
}

const diffFileFragmentsSelector = [
	'include-fragment.diff-progressive-loader', // Incremental file loader on scroll
	'include-fragment.js-diff-entry-loader', // File diff loader on clicking "Load Diff"
	'#files_bucket:not(.pull-request-tab-content) include-fragment', // Diff on compare pages
].join(',');

export function onDiffFileLoad(callback: EventListener, signal: AbortSignal): void {
	createFragmentLoadListener(diffFileFragmentsSelector, callback, signal);
}

export function onPrMergePanelLoad(callback: EventListener, signal: AbortSignal): void {
	createFragmentLoadListener('.discussion-timeline-actions include-fragment[src$="/merging"]', callback, signal);
}
