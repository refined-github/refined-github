// Memoization here is used to let onPrMergePanelOpen() be called multiple times without risking multiple attached handlers
import mem from 'mem';
import delegate, {DelegateEvent} from 'delegate-it';

const delegateHandler = mem((callback: EventListener) => (event: DelegateEvent) => {
	if (event.delegateTarget.matches('.open')) {
		callback(event);
	}
});

export default function onPrMergePanelOpen(callback: EventListener, signal: AbortSignal): void {
	delegate(document, '.js-merge-pr:not(.is-rebasing)', 'details:toggled', delegateHandler(callback), {signal});
}
