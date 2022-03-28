// Memoization here is used to let onPrMergePanelOpen() be called multiple times without risking multiple attached handlers
import mem from 'mem';
import delegate from 'delegate-it';

const delegateHandler = mem((callback: EventListener) => (event: delegate.Event) => {
	if (event.delegateTarget.matches('.open')) {
		callback(event);
	}
});

export default function onPrMergePanelOpen(callback: EventListener): delegate.Subscription {
	return delegate(document, '.js-merge-pr:not(.is-rebasing)', 'details:toggled', delegateHandler(callback));
}
