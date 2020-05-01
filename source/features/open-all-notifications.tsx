import './open-all-notifications.css';
import React from 'dom-chef';
import select from 'select-dom';
import LinkExternalIcon from 'octicon/link-external.svg';
import delegate from 'delegate-it';
import features from '../libs/features';
import * as pageDetect from '../libs/page-detect';
import {groupButtons} from '../libs/group-buttons';

const confirmationRequiredCount = 10;
const unreadNotificationsClass = '.notification-unread .notification-list-item-link';

function openNotifications({delegateTarget}: delegate.Event): void {
	const container = delegateTarget.closest('.js-notifications-group, .js-check-all-container')!;

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
	for (const notification of select.all('.notification-unread', container)) {
		notification.classList.replace('notification-unread', 'notification-read');
	}

	// Remove all now-useless buttons
	for (const button of select.all('.rgh-open-notifications-button', container)) {
		button.remove();
	}
}

function addOpenReposButton(): void {
	for (const markRepoAsDoneButton of select.all('.js-grouped-notifications-mark-all-read-button')) {
		console.log(markRepoAsDoneButton);

		const repoNotifications = markRepoAsDoneButton.closest('.js-notifications-group')!;
		console.log(repoNotifications);

		const unreadCount = select.all('.notification-unread', repoNotifications).length;
		console.log(unreadCount);
		if (unreadCount === 0) {
			continue;
		}

		const openRepoUnreadButton = (
			<button type="button" className="btn btn-sm mr-2 tooltipped tooltipped-w rgh-open-notifications-button" aria-label="Open all unread notifications from this repo">
				<LinkExternalIcon width="16"/> Open unread
			</button>
		);
		markRepoAsDoneButton.before(openRepoUnreadButton);
	}
}

function addOpenAllButton(): void {
	select('.js-check-all-container .Box-header')!.append(
		<button className="btn btn-sm rgh-open-notifications-button" type="button">
			<LinkExternalIcon className="mr-1"/>Open all unread
		</button>
	);
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
	description: 'Adds button to open all your unread notifications at once.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/80848822-e7897000-8c14-11ea-87cc-6140ce48d1a8.gif'
}, {
	include: [
		pageDetect.isNotifications
	],
	init
});
