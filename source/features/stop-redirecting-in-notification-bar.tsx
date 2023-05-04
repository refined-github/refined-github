import delegate, {DelegateEvent} from 'delegate-it';

import features from '../feature-manager.js';

const hasNotificationBar = (): boolean =>
	location.search.startsWith('?notification_referrer_id=')
	|| JSON.parse(sessionStorage.getItem('notification_shelf') ?? '{}').pathname === location.pathname;

function handleClick(event: DelegateEvent<MouseEvent, HTMLButtonElement>): void {
	// Disable the redirect to the Notifications inbox if either:
	// 1. The alt key was held down during click (user choice)
	// 2. The notification has been opened in a new tab (the inbox is still open in the previous tab)
	const redirectDisabled = event.altKey || sessionStorage.rghIsNewTab === 'true';
	event.delegateTarget.form!.toggleAttribute('data-redirect-to-inbox-on-submit', !redirectDisabled);
}

function init(signal: AbortSignal): void {
	sessionStorage.rghIsNewTab = history.length === 1;
	delegate('.notification-shelf .js-notification-action button', 'click', handleClick, {signal});
}

void features.add(import.meta.url, {
	include: [
		hasNotificationBar,
	],
	init,
});
