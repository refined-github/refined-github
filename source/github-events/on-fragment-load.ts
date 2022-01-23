import mem from 'mem';
import delegate from 'delegate-it';

// This lets you call `onDiffFileLoad` multiple times with the same callback but only ever a `load` listener is registered
const getDeduplicatedHandler = mem((callback: EventListener): delegate.EventHandler => (event: delegate.Event) => {
	event.delegateTarget.addEventListener('load', callback);
});

function createFragmentLoadListener(fragmentSelector: string, callback: EventListener): delegate.Subscription {
	// `loadstart` is fired when the fragment is still attached so event delegation works.
	// `load` is fired after it’s detached, so `delegate` would never listen to it.
	// This is why we listen to a global `loadstart` and then add a specific `load` listener on the element, which is fired even when the element is detached.
	return delegate(document, fragmentSelector, 'loadstart', getDeduplicatedHandler(callback), true);
}

const diffFileFragmentsSelector = [
	'include-fragment.diff-progressive-loader', // Incremental file loader on scroll
	'include-fragment.js-diff-entry-loader', // File diff loader on clicking "Load Diff"
	'#files_bucket:not(.pull-request-tab-content) include-fragment', // Diff on compare pages
].join(',');

export function onDiffFileLoad(callback: EventListener): delegate.Subscription {
	return createFragmentLoadListener(diffFileFragmentsSelector, callback);
}

export function onCommentEdit(callback: EventListener): delegate.Subscription {
	return createFragmentLoadListener('.js-comment-edit-form-deferred-include-fragment', callback);
}

export function onRepoHomeCiDetailsLoad(callback: EventListener): delegate.Subscription {
	return createFragmentLoadListener('.file-navigation + .Box .js-details-container include-fragment[src*="/rollup?"]', callback);
}
