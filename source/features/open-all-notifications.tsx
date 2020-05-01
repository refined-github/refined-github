import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import features from '../libs/features';
import * as pageDetect from '../libs/page-detect';
import LinkExternalIcon from 'octicon/link-external.svg';

const confirmationRequiredCount = 10;
const unreadNotificationsClass = '.notification-unread .js-navigation-open';

function openNotifications({delegateTarget}: delegate.Event): void {
	const container = delegateTarget.closest('.notifications-list')!;

	// Ask for confirmation
	const unreadNotifications = select.all<HTMLAnchorElement>(unreadNotificationsClass, container);
	if (
		unreadNotifications.length >= confirmationRequiredCount &&
		!confirm(`This will open ${unreadNotifications.length} new tabs. Continue?`)
	) {
		return;
	}

	browser.runtime.sendMessage({
		openUrls: unreadNotifications.map(element => element.href)
	});

	// Mark all as read
	for (const notification of select.all(unreadNotificationsClass, container)) {
		notification.classList.replace('notification-unread', 'notification-read');
	}

	// Remove all now-useless buttons
	for (const button of select.all(`
		.rgh-open-notifications-button,
		.js-notifications-mark-all,
	`, container)) {
		button.remove();
	}
}

function addOpenAllButton(): void {
	if (!select.exists('.rgh-open-notifications-button')) {
		// Create an open button and add it to the DOM
		const button = <button className="btn mr-3 ml-0 rgh-open-notifications-button" type="button"><LinkExternalIcon/> Open unread</button>;
		const SearchElement = select('.js-notification-search-form')!
		SearchElement.parentElement!.before(button)
	}
}

function update(): void {
	const unreadCount = select.all(unreadNotificationsClass).length;
	if (unreadCount === 0) {
		return;
	}

	addOpenAllButton();
}

function init(): void {
	document.addEventListener('refined-github:mark-unread:notifications-added', update);
	delegate(document, '.rgh-open-notifications-button', 'click', openNotifications);
	update();
}

features.add({
	id: __filebasename,
	description: 'Open all your notifications at once.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/31700005-1b3be428-b38c-11e7-90a6-8f572968993b.png'
}, {
	include: [
		pageDetect.isNotifications
	],
	init
});
