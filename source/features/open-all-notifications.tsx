import './open-all-notifications.css';
import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';
import {LinkExternalIcon} from '@primer/octicons-react';
import delegate, {DelegateEvent} from 'delegate-it';

import features from '.';
import openTabs from '../helpers/open-tabs';
import {appendBefore} from '../helpers/dom-utils';
import attachElement from '../helpers/attach-element';

// Selector works on:
// https://github.com/notifications (Grouped by date)
// https://github.com/notifications (Grouped by repo)
// https://github.com/notifications?query=reason%3Acomment (which is an unsaved filter)
const notificationHeaderSelector = '.js-check-all-container .js-bulk-action-toasts ~ div .Box-header';

const openUnread = features.getIdentifiers('open-notifications-button');
const openSelected = features.getIdentifiers('open-selected-button');

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

function openUnreadNotifications({delegateTarget, altKey}: DelegateEvent<MouseEvent>): void {
	const container = delegateTarget.closest('.js-notifications-group') ?? document;
	openNotifications(getUnreadNotifications(container), altKey);
	// Remove all now-unnecessary buttons
	removeOpenUnreadButtons(container);
}

function openSelectedNotifications(): void {
	const selectedNotifications = select.all('.notifications-list-item :checked').map(checkbox => checkbox.closest('.notifications-list-item')!);
	openNotifications(selectedNotifications);
	if (!select.exists('.notification-unread')) {
		removeOpenUnreadButtons();
	}
}

function addOpenSelectedButton(signal: AbortSignal): void {
	delegate(document, openSelected.selector, 'click', openSelectedNotifications, {signal});

	attachElement({
		anchor: notificationHeaderSelector + ' .js-notifications-mark-selected-actions',
		forEach(anchor) {
			const button = (
				<button className={'btn btn-sm ' + openSelected.class} type="button">
					<LinkExternalIcon className="mr-1"/>Open
				</button>
			);
			appendBefore(
				anchor,
				'details',
				button,
			);

			return button;
		},
	});
}

function removeOpenUnreadButtons(container: ParentNode = document): void {
	for (const button of select.all(openUnread.selector, container)) {
		button.remove();
	}
}

function addOpenUnreadButtons(signal: AbortSignal): void {
	if (getUnreadNotifications().length === 0) {
		return;
	}

	delegate(document, openUnread.selector, 'click', openUnreadNotifications, {signal});

	attachElement({
		anchor: notificationHeaderSelector,
		append: () => (
			<button className={'btn btn-sm ml-auto d-none ' + openUnread.class} type="button">
				<LinkExternalIcon className="mr-1"/>Open all unread
			</button>
		),
	});

	for (const repository of select.all('.js-notifications-group')) {
		if (getUnreadNotifications(repository).length === 0) {
			continue;
		}

		select('.js-grouped-notifications-mark-all-read-button', repository)!.before(
			<button
				type="button"
				className={'btn btn-sm mr-2 tooltipped tooltipped-w ' + openUnread.class}
				aria-label="Open all unread notifications from this repo"
			>
				<LinkExternalIcon width={16}/> Open unread
			</button>,
		);
	}
}

function init(signal: AbortSignal): void {
	addOpenSelectedButton(signal);
	addOpenUnreadButtons(signal);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isNotifications,
	],
	exclude: [
		pageDetect.isBlank, // Empty notification list
	],
	deduplicate: false,
	init,
});
