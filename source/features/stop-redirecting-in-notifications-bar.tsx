import delegate from 'delegate-it';
import elementReady from 'element-ready';
import features from '../libs/features';
import * as pageDetect from '../libs/page-detect';

function onNotificationActionClick(event: delegate.Event<MouseEvent, HTMLButtonElement>): void {
	const shouldRedirectToInbox = !event.altKey;
	const actionForm = event.delegateTarget.closest('form')!;
	actionForm.toggleAttribute('data-redirect-to-inbox-on-submit', shouldRedirectToInbox);
}

async function init(): Promise<void> {
	const notificationsBar = await elementReady('.notifications-v2.notification-shelf', {
		stopOnDomReady: false,
		timeout: 2000
	});

	if (notificationsBar) {
		delegate(notificationsBar, '.js-notification-action button', 'click', onNotificationActionClick);
	}
}

features.add({
	id: __filebasename,
	description: 'Stops redirecting to notification inbox from notification bar actions while holding `Alt`.',
	screenshot: 'https://user-images.githubusercontent.com/202916/80318782-c38cef80-880c-11ea-9226-72c585f42a51.png'
}, {
	include: [
		pageDetect.isRepo
	],
	init
});
