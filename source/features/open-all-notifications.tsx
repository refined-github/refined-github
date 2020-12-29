import './open-all-notifications.css';
import React from 'dom-chef';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';
import {LinkExternalIcon} from '@primer/octicons-react';

import features from '.';

const confirmationRequiredCount = 10;

function getUnreadNotifications(container: ParentNode = document): HTMLElement[] {
	return $$('.notification-unread', container);
}

function openNotifications({delegateTarget}: delegate.Event): void {
	const container = delegateTarget.closest('.js-notifications-group') ?? document;

	// Ask for confirmation
	const unreadNotifications = getUnreadNotifications(container);
	if (
		unreadNotifications.length >= confirmationRequiredCount &&
		!confirm(`This will open ${unreadNotifications.length} new tabs. Continue?`)
	) {
		return;
	}

	void browser.runtime.sendMessage({
		openUrls: unreadNotifications.map(element => element.$('a')!.href)
	});

	// Mark all as read
	for (const notification of unreadNotifications) {
		notification.classList.replace('notification-unread', 'notification-read');
	}

	// Remove all now-useless buttons
	for (const button of $$('.rgh-open-notifications-button', container)) {
		button.remove();
	}
}

function addOpenReposButton(): void {
	for (const repository of $$('.js-notifications-group')) {
		if (getUnreadNotifications(repository).length === 0) {
			continue;
		}

		$('.js-grouped-notifications-mark-all-read-button', repository)!.before(
			<button type="button" className="btn btn-sm mr-2 tooltipped tooltipped-w rgh-open-notifications-button" aria-label="Open all unread notifications from this repo">
				<LinkExternalIcon width={16}/> Open unread
			</button>
		);
	}
}

function addOpenAllButton(): void {
	// Selector works on:
	// https://github.com/notifications (Grouped by date)
	// https://github.com/notifications (Grouped by repo)
	// https://github.com/notifications?query=reason%3Acomment (which is an unsaved filter)
	$('.js-check-all-container .js-bulk-action-toasts ~ div .Box-header')!.append(
		<button className="btn btn-sm rgh-open-notifications-button" type="button">
			<LinkExternalIcon className="mr-1"/>Open all unread
		</button>
	);
}

function update(): void {
	if (getUnreadNotifications().length > 0) {
		addOpenAllButton();
		addOpenReposButton();
	}
}

function init(): void {
	delegate(document, '.rgh-open-notifications-button', 'click', openNotifications);
	update();
}

void features.add(__filebasename, {
	include: [
		pageDetect.isNotifications
	],
	init
});
