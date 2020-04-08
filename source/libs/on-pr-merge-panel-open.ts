// Memoization here is used to let onPrMergePanelOpen() be called multiple times without risking multiple attached handlers
import mem from 'mem';
import delegate from 'delegate-it';

const delegateHandler = mem((callback: EventListener) => (event: delegate.Event) => {
	if (event.delegateTarget.matches('.open')) {
		callback(event);
	}
});

const sessionResumeHandler = mem((callback: EventListener) => async (event: Event) => {
	await Promise.resolve(); // The `session:resume` event fires a bit too early
	callback(event);
});

export default function (callback: EventListener): delegate.Subscription {
	document.addEventListener(
		'session:resume',
		sessionResumeHandler(callback)
	);
	const toggleSubscription = delegate(
		document,
		'.js-merge-pr:not(.is-rebasing)',
		'details:toggled',
		delegateHandler(callback)
	);

	// Imitate a delegate.Subscription for this event as well
	return {
		destroy() {
			toggleSubscription.destroy();
			document.removeEventListener(
				'session:resume',
				sessionResumeHandler(callback)
			);
		}
	};
}
