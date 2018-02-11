import {h} from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate';
import pEvent from 'p-event';
import gitHubInjection from 'github-injection';
import observeEl from '../libs/simplified-element-observer';
import * as icons from '../libs/icons';
import {groupButtons, safeElementReady} from '../libs/utils';
import {isNotifications} from '../libs/page-detect';

const confirmationRequiredCount = 10;
const unreadNotificationsClass = '.unread .js-notification-target';

async function openNotifications({delegateTarget}) {
	const container = delegateTarget.closest('.boxed-group, .notification-center');

	// Ask for confirmation
	const unreadNotifications = select.all(unreadNotificationsClass, container);
	if (unreadNotifications.length >= confirmationRequiredCount) {
		// Open confirmation box
		select('#rgh-open-notifications-confirmation-trigger').click();

		await safeElementReady('#facebox-description');
		select('#facebox-description').textContent = `Are you sure you want to open ${unreadNotifications.length} tabs?`;

		// Wait for confirm or close
		const event = await Promise.race([
			pEvent(select('#rgh-open-notifications-confirm'), 'click'),
			pEvent(document, 'facebox:close')
		]);

		if (event.type === 'facebox:close') {
			return;
		}

		// Close modal and continue
		select('.js-facebox-close').click();
	}

	// Open all in tabs
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
		const group = select('.tabnav .float-right');
		group.prepend(
			<button class="btn btn-sm rgh-open-notifications-button">Open all unread in tabs</button>
		);
		groupButtons([...group.children]);
	}
}

function addConfirmationBox() {
	if (!select.exists('#rgh-open-notifications-confirmation')) {
		document.body.append(
			<a href="#rgh-open-notifications-confirmation" id="rgh-open-notifications-confirmation-trigger" rel="facebox" style={{display: 'none'}}></a>,
			<div id="rgh-open-notifications-confirmation" style={{display: 'none'}}>
				<h2 class="facebox-header" data-facebox-id="facebox-header">Are you sure?</h2>
				<p data-facebox-id="facebox-description"></p>
				<div class="full-button">
					<button class="btn btn-block" id="rgh-open-notifications-confirm">Open all notifications</button>
				</div>
			</div>
		);
	}
}

function addMarkup() {
	const unreadCount = select.all(unreadNotificationsClass).length;
	if (unreadCount < 2) {
		return;
	}

	addOpenAllButton();
	addOpenReposButton();

	if (unreadCount >= confirmationRequiredCount) {
		addConfirmationBox();
	}
}

export default async function () {
	if (!isNotifications()) {
		return;
	}

	delegate('.rgh-open-notifications-button', 'click', openNotifications);

	gitHubInjection(() => {
		// Add support for Mark as Unread
		observeEl(
			select('.notifications-list') || select('.js-navigation-container'),
			addMarkup
		);
	});
}
