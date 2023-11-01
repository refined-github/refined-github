import './open-all-notifications.css';
import React from 'dom-chef';
import {$$, elementExists} from 'select-dom';
import * as pageDetect from 'github-url-detection';
import {LinkExternalIcon} from '@primer/octicons-react';
import delegate, {DelegateEvent} from 'delegate-it';

import features from '../feature-manager.js';
import openTabs from '../helpers/open-tabs.js';
import {appendBefore} from '../helpers/dom-utils.js';
import observe from '../helpers/selector-observer.js';

// Selector works on:
// https://github.com/notifications (Grouped by date)
// https://github.com/notifications (Grouped by repo)
// https://github.com/notifications?query=reason%3Acomment (which is an unsaved filter)
const notificationHeaderSelector = '.js-check-all-container .js-bulk-action-toasts ~ div .Box-header';

const openUnread = features.getIdentifiers('open-notifications-button');
const openSelected = features.getIdentifiers('open-selected-button');

function getUnreadNotifications(container: ParentNode = document): HTMLElement[] {
	return $$('.notification-unread', container);
}

async function openNotifications(notifications: Element[], markAsDone = false): Promise<void> {
	const urls = notifications
		.reverse() // Open oldest first #6755
		.map(notification => notification.querySelector('a')!.href);

	const openingTabs = openTabs(urls);
	if (!await openingTabs) {
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

async function openUnreadNotifications({delegateTarget, altKey}: DelegateEvent<MouseEvent>): Promise<void> {
	const container = delegateTarget.closest('.js-notifications-group') ?? document;
	await openNotifications(getUnreadNotifications(container), altKey);

	// Remove all now-unnecessary buttons
	removeOpenUnreadButtons(container);
}

async function openSelectedNotifications(): Promise<void> {
	const selectedNotifications = $$('.notifications-list-item :checked')
		.map(checkbox => checkbox.closest('.notifications-list-item')!);
	await openNotifications(selectedNotifications);

	if (!elementExists('.notification-unread')) {
		removeOpenUnreadButtons();
	}
}

function removeOpenUnreadButtons(container: ParentNode = document): void {
	for (const button of $$(openUnread.selector, container)) {
		button.remove();
	}
}

function addSelectedButton(selectedActionsGroup: HTMLElement): void {
	const button = (
		<button className={'btn btn-sm mr-2 ' + openSelected.class} type="button">
			<LinkExternalIcon className="mr-1"/>Open
		</button>
	);
	appendBefore(
		selectedActionsGroup,
		'details',
		button,
	);
}

function addToRepoGroup(markReadButton: HTMLElement): void {
	const repository = markReadButton.closest('.js-notifications-group')!;
	if (getUnreadNotifications(repository).length === 0) {
		return;
	}

	markReadButton.before(
		<button
			type="button"
			className={'btn btn-sm mr-2 tooltipped tooltipped-w ' + openUnread.class}
			aria-label="Open all unread notifications from this repo"
		>
			<LinkExternalIcon width={16}/> Open unread
		</button>,
	);
}

function addToMainHeader(notificationHeader: HTMLElement): void {
	if (getUnreadNotifications().length === 0) {
		return;
	}

	notificationHeader.append(
		<button className={'btn btn-sm ml-auto d-none ' + openUnread.class} type="button">
			<LinkExternalIcon className="mr-1"/>Open all unread
		</button>,
	);
}

function init(signal: AbortSignal): void {
	delegate(openSelected.selector, 'click', openSelectedNotifications, {signal});
	delegate(openUnread.selector, 'click', openUnreadNotifications, {signal});

	observe(notificationHeaderSelector + ' .js-notifications-mark-selected-actions', addSelectedButton, {signal});
	observe(notificationHeaderSelector, addToMainHeader, {signal});
	observe('.js-grouped-notifications-mark-all-read-button', addToRepoGroup, {signal});
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

/*

Test URLs:

https://github.com/notifications (Grouped by date)
https://github.com/notifications (Grouped by repo)
https://github.com/notifications?query=reason%3Acomment (which is an unsaved filter)

*/
