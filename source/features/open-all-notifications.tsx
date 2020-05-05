import './open-all-notifications.css';
import React from 'dom-chef';
import select from 'select-dom';
import LinkExternalIcon from 'octicon/link-external.svg';
import delegate from 'delegate-it';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';

const confirmationRequiredCount = 10;

function getUnreadNotifications(container: ParentNode = document): HTMLAnchorElement[] {
	return select.all<HTMLAnchorElement>('.notification-unread', container);
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

	browser.runtime.sendMessage({
		openUrls: unreadNotifications.map(element => element.querySelector('a')!.href)
	});

	// Mark all as read
	for (const notification of unreadNotifications) {
		notification.classList.replace('notification-unread', 'notification-read');
	}

	// Remove all now-useless buttons
	for (const button of select.all('.rgh-open-notifications-button', container)) {
		button.remove();
	}
}

function addOpenReposButton(): void {
	for (const repository of select.all('.js-notifications-group')) {
		if (getUnreadNotifications(repository).length === 0) {
			continue;
		}

		select('.js-grouped-notifications-mark-all-read-button', repository)!.before(
			<button type="button" className="btn btn-sm mr-2 tooltipped tooltipped-w rgh-open-notifications-button" aria-label="Open all unread notifications from this repo">
				<LinkExternalIcon width={16}/> Open unread
			</button>
		);
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
	if (getUnreadNotifications().length > 0) {
		addOpenAllButton();
		addOpenReposButton();
	}
}

function init(): void {
	document.addEventListener('refined-github:mark-unread:notifications-added', update);
	delegate(document, '.rgh-open-notifications-button', 'click', openNotifications);
	update();
}

features.add({
	id: __filebasename,
	description: 'Adds button to open all your unread notifications at once.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/80861295-fbad8b80-8c6d-11ea-87a4-8025fbc3a3f4.png'
}, {
	include: [
		pageDetect.isNotifications
	],
	init
});
