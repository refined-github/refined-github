import delegate, {DelegateSubscription} from 'delegate-it';

const fragmentSelector = [
	'include-fragment.diff-progressive-loader', // Incremental file loader on scroll
	'include-fragment.js-diff-entry-loader' // File diff loader on clicking "Load Diff"
].join();

export default function onPrFileLoad(callback: EventListener): DelegateSubscription {
	return delegate(fragmentSelector, 'load', callback, true);
}
