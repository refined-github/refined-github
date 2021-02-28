import select from 'select-dom';
import delegate from 'delegate-it';

const discussionsWithListeners = new WeakSet();
const handlers = new Set<VoidFunction>();
const delegates = new Set<delegate.Subscription>();
const observer = new MutationObserver(run);

function run(): void {
	// Run all callbacks without letting an error stop the loop and without silencing it
	// eslint-disable-next-line unicorn/no-array-for-each
	handlers.forEach(async callback => {
		callback();
	});
}

// The form is detached just before the `page:loaded` event is triggered so the event won’t bubble up and `delegate` won’t catch it.
// This intermediate handler is required to catch the `page:loaded` event on the detached element.
function paginationSubmitHandler({delegateTarget: form}: delegate.Event): void {
	form.addEventListener('page:loaded', run, {once: true});
}

function removeListeners(): void {
	for (const subscription of delegates) {
		subscription.destroy();
	}

	delegates.clear();
	handlers.clear();
	observer.disconnect();
}

function getFragmentLoadHandler(callback: EventListener): delegate.EventHandler {
	return ({delegateTarget}) => {
		delegateTarget.addEventListener('load', callback);
	};
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

	// When hidden comments are loaded by clicking "Load more…"
	delegates.add(delegate(document, '.js-ajax-pagination', 'submit', paginationSubmitHandler));

	// Collapsed comments are loaded later using an include-fragment element
	delegates.add(delegate(document, 'details.js-comment-container include-fragment', 'loadstart', getFragmentLoadHandler(run), true));
}

export default function onNewComments(callback: VoidFunction): void {
	addListeners();
	handlers.add(callback);
}
