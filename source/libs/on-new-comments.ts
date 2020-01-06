import select from 'select-dom';
import delegate, {DelegateSubscription} from 'delegate-it';

const discussionsWithListeners = new WeakSet();
const handlers = new Set<VoidFunction>();
const delegates = new Set<DelegateSubscription>();
const observer = new MutationObserver(run);

function run(): void {
	// Run all callbacks without letting an error stop the loop and without silencing it
	handlers.forEach(async callback => callback());
}

function removeListeners(): void {
	for (const subscription of delegates) {
		subscription.destroy();
	}

	delegates.clear();
	handlers.clear();
	observer.disconnect();
}

function addListeners(): void {
	const discussion = select('.js-discussion');
	if (!discussion || discussionsWithListeners.has(discussion)) {
		return;
	}

	// Ensure listeners are only ever added once
	discussionsWithListeners.add(discussion);

	// Remember to remove all listeners when a new page is loaded
	document.addEventListener('pjax:beforeReplace', removeListeners);

	// When new comments come in via AJAX
	observer.observe(discussion, {
		childList: true
	});

	// When hidden comments are loaded by clicking "Load more..."
	delegates.add(delegate('.js-ajax-pagination', 'page:loaded', run));

	// Outdated comment are loaded later using an include-fragment element
	delegates.add(delegate('details.outdated-comment > include-fragment', 'load', run, true));
}

export default function (callback: VoidFunction): void {
	addListeners();
	handlers.add(callback);
}
