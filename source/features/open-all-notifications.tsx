import './open-all-notifications.css';
import React from 'dom-chef';
import select from 'select-dom';
import delegate, {DelegateEvent} from 'delegate-it';
import features from '../libs/features';
import * as icons from '../libs/icons';
import {groupButtons} from '../libs/group-buttons';

const confirmationRequiredCount = 10;
const unreadNotificationsClass = '.unread .js-notification-target';

function openNotifications({delegateTarget}: DelegateEvent): void {
	const container = delegateTarget.closest('.boxed-group, .notification-center');

	// Ask for confirmation
	const unreadNotifications = select.all<HTMLAnchorElement>(unreadNotificationsClass, container!);
	if (
		unreadNotifications.length >= confirmationRequiredCount &&
		!confirm(`This will open ${unreadNotifications.length} new tabs. Continue?`)
	) {
		return;
	}

	browser.runtime.sendMessage({
		openUrls: unreadNotifications.map(el => el.href)
	});

	// Mark all as read
	for (const notification of select.all('.unread', container!)) {
		notification.classList.replace('unread', 'read');
	}

	// Remove all now-useless buttons
	for (const button of select.all(`
		.rgh-open-notifications-button,
		.open-repo-notifications,
		.mark-all-as-read,
		[href='#mark_as_read_confirm_box']
	`, container!)) {
		button.remove();
	}
}

function addOpenReposButton(): void {
	for (const repoNotifications of select.all('.boxed-group')) {
		if (select.exists('.open-repo-notifications', repoNotifications)) {
			continue;
		}

		const unreadCount = select.all('.unread', repoNotifications).length;
		if (unreadCount === 0) {
			continue;
		}

		const [, repo] = select<HTMLAnchorElement>('.notifications-repo-link', repoNotifications)!.title.split('/');

		select('.mark-all-as-read', repoNotifications)!.before(
			<button type="button" className="open-repo-notifications tooltipped tooltipped-w rgh-open-notifications-button" aria-label={`Open all unread \`${repo}\` notifications in tabs`}>
				{icons.externalLink()}
			</button>
		);
	}
}

function addOpenAllButton(): void {
	if (!select.exists('.rgh-open-notifications-button')) {
		// Move out the extra node that messes with .BtnGroup-item:last-child
		document.body.append(select('#mark_as_read_confirm_box') || '');

		// Create an open button and add it into a button group
		const button = <button className="btn btn-sm rgh-open-notifications-button">Open all unread in tabs</button>;
		select('.tabnav .float-right')!.prepend(button);

		// There is no sibling on `/<org>/<repo>/notifications` page
		if (button.nextElementSibling) {
			groupButtons([button, button.nextElementSibling]);
		}
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
	delegate('.rgh-open-notifications-button', 'click', openNotifications);
	update();
}

features.add({
	id: __featureName__,
	description: 'Open all your notifications at once.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/31700005-1b3be428-b38c-11e7-90a6-8f572968993b.png',
	include: [
		features.isNotifications
	],
	load: features.onAjaxedPages,
	init
});
