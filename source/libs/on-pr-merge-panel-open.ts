// Memoization here is used to let onPrMergePanelOpen() be called multiple times without risking multiple attached handlers
import mem from 'mem';
import delegate, {DelegateSubscription, DelegateEvent} from 'delegate-it';

const delegateHandler = mem((callback: EventListener) => (event: DelegateEvent) => {
	if (event.delegateTarget.matches('.open')) {
		callback(event);
	}
});

const sessionResumeHandler = mem((callback: EventListener) => async (event: Event) => {
	await Promise.resolve(); // The `session:resume` event fires a bit too early
	callback(event);
});

export default function (callback: EventListener): DelegateSubscription[] {
	document.addEventListener(
		'session:resume',
		sessionResumeHandler(callback)
	);

	return [
		{
			// Imitate a DelegateSubscription for this event as well
			destroy() {
				document.removeEventListener(
					'session:resume',
					sessionResumeHandler(callback)
				);
			}
		},
		...delegate(
			'#discussion_bucket',
			'.js-merge-pr:not(.is-rebasing)',
			'details:toggled',
			delegateHandler(callback)
		)
	];
}
