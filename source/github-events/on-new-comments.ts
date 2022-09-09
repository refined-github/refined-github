import select from 'select-dom';
import delegate, {DelegateEvent, DelegateEventHandler} from 'delegate-it';

import onAbort from '../helpers/abort-controller';

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
function paginationSubmitHandler({delegateTarget: form}: DelegateEvent): void {
	form.addEventListener('page:loaded', run, {once: true});
}

function getFragmentLoadHandler(callback: EventListener): DelegateEventHandler {
	return ({delegateTarget}) => {
		delegateTarget.addEventListener('load', callback);
	};
}

function addListeners(signal: AbortSignal): void {
	const discussion = select('.js-discussion');
	// Ensure listeners are only ever added once
	if (!discussion || handlers.size === 0) {
		return;
	}

	// When new comments come in via AJAX
	commentsCount = select.all('.js-comment').length;
	observer.observe(discussion, {
		childList: true,
	});

	onAbort(signal, observer);

	// When hidden comments are loaded by clicking "Load more…"
	delegate(document, '.js-ajax-pagination', 'submit', paginationSubmitHandler, {signal});

	// Collapsed comments are loaded later using an include-fragment element
	delegate(document, 'details.js-comment-container include-fragment:not([class])', 'loadstart', getFragmentLoadHandler(run), {capture: true, signal});
}

export default function onNewComments(callback: VoidFunction, signal: AbortSignal): void {
	addListeners(signal);
	handlers.add(callback);
	onAbort(signal, handlers);
}
