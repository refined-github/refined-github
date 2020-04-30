import delegate from 'delegate-it';
import features from '../libs/features';

const hasNotificationBar = (): boolean =>
	location.search.startsWith('?notification_referrer_id=') ||
	JSON.parse(sessionStorage.notification_shelf ?? '{}').pathname === location.pathname;

function onNotificationActionClick(event: delegate.Event<MouseEvent, HTMLButtonElement>): void {
	const shouldRedirectToInbox = !event.altKey;
	const actionForm = event.delegateTarget.closest('form')!;

	// Re-adds attribute for non-alt click after alt-clicks
	actionForm.toggleAttribute('data-redirect-to-inbox-on-submit', shouldRedirectToInbox);
}

async function init(): Promise<void> {
	const actionButtonSelector = '.notification-shelf .js-notification-action button';
	delegate(document, actionButtonSelector, 'click', onNotificationActionClick);
}

features.add({
	id: __filebasename,
	description: 'Stops redirecting to notification inbox from notification bar actions while holding `Alt`.',
	screenshot: 'https://user-images.githubusercontent.com/202916/80318782-c38cef80-880c-11ea-9226-72c585f42a51.png'
}, {
	include: [
		hasNotificationBar
	],
	waitForDomReady: false,
	repeatOnAjax: false,
	init
});
