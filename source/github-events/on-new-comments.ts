import select from 'select-dom';
import delegate from 'delegate-it';

const discussionsWithListeners = new WeakSet();
const handlers = new Set<VoidFunction>();

let commentsCount = 0;
const observer = new MutationObserver(() => {
	const commentsNewCount = select.all('.js-comment').length;
	if (commentsNewCount > commentsCount) {
		commentsCount = commentsNewCount; // Update the count ASAP to avoid duplicate calls
		run();
	}

	commentsCount = commentsNewCount;
});

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

function getFragmentLoadHandler(callback: EventListener): delegate.EventHandler {
	return ({delegateTarget}) => {
		delegateTarget.addEventListener('load', callback);
	};
}

function addListeners(): Deinit[] {
	const discussion = select('.js-discussion');
	if (!discussion || discussionsWithListeners.has(discussion)) {
		return [];
	}

	// Ensure listeners are only ever added once
	discussionsWithListeners.add(discussion);

	// When new comments come in via AJAX
	commentsCount = select.all('.js-comment').length;
	observer.observe(discussion, {
		childList: true,
	});

	return [
		// When hidden comments are loaded by clicking "Load more…"
		delegate(document, '.js-ajax-pagination', 'submit', paginationSubmitHandler),

		// Collapsed comments are loaded later using an include-fragment element
		delegate(document, 'details.js-comment-container include-fragment:not([class])', 'loadstart', getFragmentLoadHandler(run), true),
	];
}

export default function onNewComments(callback: VoidFunction): Deinit[] {
	handlers.add(callback);

	return [
		...addListeners(),
		handlers.clear,
		observer.disconnect,
	];
}
