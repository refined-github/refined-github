import './open-all-notifications.css';
import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';
import {LinkExternalIcon} from '@primer/octicons-react';

import features from '.';
import openTabs from '../helpers/open-tabs';

function getUnreadNotifications(container: ParentNode = document): HTMLElement[] {
	return select.all('.notification-unread', container);
}

function openNotifications(notifications: Element[], markAsDone = false): void {
	const urls: string[] = [];
	for (const notification of notifications) {
		urls.push(notification.querySelector('a')!.href);
	}

	if (!openTabs(urls)) {
		return;
	}

	for (const notification of notifications) {
		if (markAsDone) {
			notification.querySelector('[title="Done"]')!.click();
		} else {
			// Mark all as read instead
			notification.classList.replace('notification-unread', 'notification-read');
		}
	}
}

function removeOpenAllButtons(container: ParentNode = document): void {
	for (const button of select.all('.rgh-open-notifications-button', container)) {
		button.remove();
	}
}

function openUnreadNotifications({delegateTarget, altKey}: delegate.Event<MouseEvent>): void {
	const container = delegateTarget.closest('.js-notifications-group') ?? document;
	openNotifications(getUnreadNotifications(container), altKey);
	// Remove all now-unnecessary buttons
	removeOpenAllButtons(container);
}

function openSelectedNotifications(): void {
	const selectedNotifications = select.all('.notifications-list-item :checked').map(checkbox => checkbox.closest('.notifications-list-item')!);
	openNotifications(selectedNotifications);
	if (!select.exists('.notification-unread')) {
		removeOpenAllButtons();
	}
}

function addOpenRepoButtons(): void {
	for (const repository of select.all('.js-notifications-group')) {
		if (getUnreadNotifications(repository).length === 0) {
			continue;
		}

		select('.js-grouped-notifications-mark-all-read-button', repository)!.before(
			<button type="button" className="btn btn-sm mr-2 tooltipped tooltipped-w rgh-open-notifications-button" aria-label="Open all unread notifications from this repo">
				<LinkExternalIcon width={16}/> Open unread
			</button>,
		);
	}
}

// Selector works on:
// https://github.com/notifications (Grouped by date)
// https://github.com/notifications (Grouped by repo)
// https://github.com/notifications?query=reason%3Acomment (which is an unsaved filter)
const notificationHeaderSelector = '.js-check-all-container .js-bulk-action-toasts ~ div .Box-header';

const openUnreadButtonClass = 'rgh-open-notifications-button';
const openSelectedButtonClass = 'rgh-open-selected-button';

function init(): Deinit {
	const deinit = [delegate(document, '.' + openSelectedButtonClass, 'click', openSelectedNotifications)];
	select(notificationHeaderSelector + ' .js-notifications-mark-selected-actions')!.append(
		<button className={'btn btn-sm ' + openSelectedButtonClass} type="button">
			<LinkExternalIcon className="mr-1"/>Open
		</button>,
	);

	if (getUnreadNotifications().length > 0) {
		deinit.push(delegate(document, '.' + openUnreadButtonClass, 'click', openUnreadNotifications));
		select(notificationHeaderSelector)!.append(
			<button className={'btn btn-sm ml-auto d-none ' + openUnreadButtonClass} type="button">
				<LinkExternalIcon className="mr-1"/>Open all unread
			</button>,
		);
		addOpenRepoButtons();
	}

	return deinit;
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isNotifications,
	],
	exclude: [
		pageDetect.isBlank, // Empty notification list
	],
	init,
});
