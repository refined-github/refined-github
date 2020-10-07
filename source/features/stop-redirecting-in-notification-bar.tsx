import onetime from 'onetime';
import delegate from 'delegate-it';

import features from '.';

const hasNotificationBar = (): boolean =>
	location.search.startsWith('?notification_referrer_id=') ||
	JSON.parse(sessionStorage.notification_shelf ?? '{}').pathname === location.pathname;

function handleClick(event: delegate.Event<MouseEvent, HTMLButtonElement>): void {
	// Disable the redirect to the Notifications inbox if either:
	// 1. The alt key was held down during click (user choice)
	// 2. The notification has been opened in a new tab (the inbox is still open in the previous tab)
	const redirectDisabled = event.altKey || sessionStorage.rghIsNewTab === 'true';
	event.delegateTarget.form!.toggleAttribute('data-redirect-to-inbox-on-submit', !redirectDisabled);
}

function init(): void {
	sessionStorage.rghIsNewTab = history.length === 1;
	delegate(document, '.notification-shelf .js-notification-action button', 'click', handleClick);
}

void features.add({
	id: __filebasename,
	description: 'Stops redirecting to notification inbox from notification bar actions while holding `Alt`.',
	screenshot: 'https://user-images.githubusercontent.com/202916/80318782-c38cef80-880c-11ea-9226-72c585f42a51.png'
}, {
	include: [
		hasNotificationBar
	],
	awaitDomReady: false,
	init: onetime(init)
});
