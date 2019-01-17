/* eslint-disable no-alert */
import {React} from 'dom-chef/react';
import select from 'select-dom';
import features from '../libs/features';
import * as icons from '../libs/icons';
import {groupButtons} from '../libs/group-buttons';

const confirmationRequiredCount = 10;
const unreadNotificationsClass = '.unread .js-notification-target';

function openNotifications({target}) {
	// Homemade delegate event, simplifies addEventListener deduplication
	if (!target.closest('.rgh-open-notifications-button')) {
		return;
	}

	const container = target.closest('.boxed-group, .notification-center');

	// Ask for confirmation
	const unreadNotifications = select.all(unreadNotificationsClass, container);
	if (
		unreadNotifications.length >= confirmationRequiredCount &&
		!confirm(`This will open ${unreadNotifications.length} new tabs. Continue?`)
	) {
		return;
	}

	browser.runtime.sendMessage({
		urls: unreadNotifications.map(el => el.href),
		action: 'openAllInTabs'
	});

	// Mark all as read
	for (const notification of select.all('.unread', container)) {
		notification.classList.replace('unread', 'read');
	}

	// Remove all now-useless buttons
	for (const button of select.all(`
		.rgh-open-notifications-button,
		.open-repo-notifications,
		.mark-all-as-read,
		[href='#mark_as_read_confirm_box']
	`, container)) {
		button.remove();
	}
}

function addOpenReposButton() {
	for (const repoNotifications of select.all('.boxed-group')) {
		if (select.exists('.open-repo-notifications', repoNotifications)) {
			continue;
		}

		const unreadCount = select.all('.unread', repoNotifications).length;
		if (unreadCount === 0) {
			continue;
		}

		const [, repo] = select('.notifications-repo-link', repoNotifications).title.split('/');

		select('.mark-all-as-read', repoNotifications).before(
			<button type="button" class="open-repo-notifications tooltipped tooltipped-w rgh-open-notifications-button" aria-label={`Open all unread \`${repo}\` notifications in tabs`}>
				{icons.externalLink()}
			</button>
		);
	}
}

function addOpenAllButton() {
	if (!select.exists('.rgh-open-notifications-button')) {
		// Move out the extra node that messes with .BtnGroup-item:last-child
		document.body.append(select('#mark_as_read_confirm_box') || '');

		// Create an open button and add it into a button group
		const button = <button class="btn btn-sm rgh-open-notifications-button">Open all unread in tabs</button>;
		select('.tabnav .float-right').prepend(button);
		groupButtons([button, button.nextElementSibling]);
	}
}

function update() {
	const unreadCount = select.all(unreadNotificationsClass).length;
	if (unreadCount === 0) {
		return false;
	}

	addOpenAllButton();
	addOpenReposButton();
}

function init() {
	document.addEventListener('refined-github:mark-unread:notifications-added', update);
	document.addEventListener('click', openNotifications);
	update();
}

features.add({
	id: 'open-all-notifications',
	include: [
		features.isNotifications
	],
	load: features.onAjaxedPages,
	init
});
