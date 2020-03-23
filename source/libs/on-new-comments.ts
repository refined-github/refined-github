import select from 'select-dom';
import delegate, {DelegateSubscription} from 'delegate-it';

const delegates = new Set<DelegateSubscription>();
const observer = new MutationObserver(newCommentsEvent);

let target: EventTarget | undefined;

function newCommentsEvent(): void {
	target!.dispatchEvent(new CustomEvent('new-comments'));
}

function removeListeners(): void {
	target = undefined;
	for (const subscription of delegates) {
		subscription.destroy();
	}

	delegates.clear();
	observer.disconnect();
}

function addListeners(): void {
	const discussion = select('.js-discussion');
	if (!discussion) {
		return;
	}

	// When new comments come in via AJAX
	observer.observe(discussion, {
		childList: true
	});

	// When hidden comments are loaded by clicking "Load more..."
	delegates.add(delegate('.js-ajax-pagination', 'page:loaded', newCommentsEvent));

	// Outdated comment are loaded later using an include-fragment element
	delegates.add(delegate('details.outdated-comment > include-fragment', 'load', newCommentsEvent, true));
}

export default function (callback: VoidFunction): void {
	target = new EventTarget();
	addListeners();

	target.addEventListener('new-comments', callback);

	document.addEventListener('pjax:beforeReplace', removeListeners, {
		once: true
	});
}
