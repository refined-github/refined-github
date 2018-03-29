/* eslint-disable no-alert */
import {h} from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate';
import observeEl from '../libs/simplified-element-observer';
import * as icons from '../libs/icons';
import {groupSiblings} from '../libs/group-buttons';
import {safeOnAjaxedPages} from '../libs/utils';
import {isNotifications} from '../libs/page-detect';

const confirmationRequiredCount = 10;
const unreadNotificationsClass = '.unread .js-notification-target';

async function openNotifications({delegateTarget}) {
	const container = delegateTarget.closest('.boxed-group, .notification-center');

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

	// Mark all as read, this also enables the native "marked as read notification"
	for (const button of select.all('.mark-all-as-read', container)) {
		button.click();
	}
}

function addOpenReposButton() {
	for (const repoNotifications of select.all('.boxed-group')) {
		if (select.exists('.open-repo-notifications', repoNotifications)) {
			continue;
		}

		const unreadCount = select.all('.unread', repoNotifications).length;
		if (unreadCount < 2) {
			continue;
		}

		const repo = select('.notifications-repo-link', repoNotifications).title.split('/')[1];

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
		groupSiblings(button);
	}
}

function addMarkup() {
	const unreadCount = select.all(unreadNotificationsClass).length;
	if (unreadCount < 2) {
		return;
	}

	addOpenAllButton();
	addOpenReposButton();
}

export default async function () {
	if (!isNotifications()) {
		return;
	}

	delegate('.rgh-open-notifications-button', 'click', openNotifications);

	safeOnAjaxedPages(() => {
		// Add support for Mark as Unread
		observeEl(
			select('.notifications-list') || select('.js-navigation-container'),
			addMarkup
		);
	});
}
