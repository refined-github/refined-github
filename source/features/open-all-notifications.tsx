import './open-all-notifications.css';
import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import features from '../libs/features';
import * as pageDetect from '../libs/page-detect';
import LinkExternalIcon from 'octicon/link-external.svg';

const confirmationRequiredCount = 10;
const unreadNotificationsClass = '.notification-unread .notification-list-item-link';

function openNotifications({delegateTarget}: delegate.Event): void {
	const container = delegateTarget.closest('.notifications-list, .js-notifications-group') ?? select('.Box.js-notifications-group')?.parentElement;

	// Ask for confirmation
	const unreadNotifications = select.all<HTMLAnchorElement>(unreadNotificationsClass, container!);
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
	for (const notification of select.all('.notification-unread', container!)) {
		notification.classList.replace('notification-unread', 'notification-read');
	}

	// Remove all now-useless buttons
	for (const button of select.all(`
		.rgh-open-notifications-button,
		.js-grouped-notifications-mark-all-read-button
	`, container!)) {
		button.remove();
	}

	const unreadCount = select.all<HTMLAnchorElement>(unreadNotificationsClass).length;
	if (unreadCount === 0) {
		select('.rgh-open-all-notifications-button')?.remove();
	}
}

function addOpenReposButton(): void {
	for (const repoNotifications of select.all('.js-notifications-group')) {
		if (select.exists('.rgh-open-repo-notifications', repoNotifications)) {
			continue;
		}

		const unreadCount = select.all(unreadNotificationsClass, repoNotifications).length;
		if (unreadCount === 0) {
			continue;
		}

		select('.js-grouped-notifications-mark-all-read-button', repoNotifications)!.before(
			<button type="button" className="btn-link px-2 rgh-open-repo-notifications rgh-open-notifications-button tooltipped tooltipped-w" aria-label="Open all unread notifications in tabs">
				<LinkExternalIcon/>
			</button>
		);
	}
}

function addOpenAllButton(): void {
	if (!select.exists('.rgh-open-all-notifications-button')) {
		// Create an open button and add it to the DOM
		const html = (
			<div className="no-wrap d-flex flex-auto flex-justify-end">
				<button type="button" className="btn-link px-2 rgh-open-all-notifications-button rgh-open-notifications-button"><LinkExternalIcon/> Open all unread</button>
			</div>
		);

		select('.notifications-list .Box-header')?.append(html);
		select('.js-notifications-mark-all-prompt')?.parentElement?.parentElement?.append(html);
	}
}

function update(): void {
	const unreadCount = select.all(unreadNotificationsClass).length;
	if (unreadCount === 0) {
		return;
	}

	addOpenAllButton();
	addOpenReposButton();
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
