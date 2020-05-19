import delegate from 'delegate-it';

import features from '.';

const hasNotificationBar = (): boolean =>
	location.search.startsWith('?notification_referrer_id=') ||
	JSON.parse(sessionStorage.notification_shelf ?? '{}').pathname === location.pathname;

function handleClick(event: delegate.Event<MouseEvent, HTMLButtonElement>): void {
	// Also restores the attribute on successive non-alt clicks
	event.delegateTarget.form!.toggleAttribute('data-redirect-to-inbox-on-submit', !event.altKey);
}

async function init(): Promise<void> {
	delegate(document, '.notification-shelf .js-notification-action button', 'click', handleClick);
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
