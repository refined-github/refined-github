import {h} from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate';
import gitHubInjection from 'github-injection';
import observeEl from '../libs/simplified-element-observer';
import * as icons from '../libs/icons';
import {groupButtons, safeElementReady} from '../libs/utils';
import {isNotifications} from '../libs/page-detect';

const confirmationRequiredCount = 10;
const unreadNotificationsClass = '.unread .js-notification-target';
let notificationsToOpen = [];

const faceboxTrigger = (
	<a href="#open-all-in-tabs" id="facebox-trigger" rel="facebox" style={{display: 'none'}}></a>
);

faceboxTrigger.addEventListener('click', async () => {
	await safeElementReady('#facebox-description');

	select('#facebox-description').textContent = `Are you sure you want to open ${notificationsToOpen.length} tabs?`;
});

function openNotifications(unreadNotifications = notificationsToOpen) {
	const urls = unreadNotifications.map(el => el.href);

	browser.runtime.sendMessage({
		urls,
		action: 'openAllInTabs'
	});

	for (const notification of unreadNotifications) {
		const listItem = notification.closest('.js-notification');
		listItem.classList.remove('unread');
		listItem.classList.add('read');
	}
}

function tryOpeningNotifications(container) {
	notificationsToOpen = select.all(unreadNotificationsClass, container);

	if (notificationsToOpen.length < confirmationRequiredCount) {
		openNotifications();
	} else {
		faceboxTrigger.click();
	}
}

function addOpenReposButton() {
	const repoNotificationContainers = select.all('.boxed-group');

	for (const repoNotificationContainer of repoNotificationContainers) {
		if (select.exists('.open-repo-notifications', repoNotificationContainer)) {
			return;
		}

		const unreadCount = select.all('.unread', repoNotificationContainer).length;
		if (unreadCount < 2) {
			continue;
		}

		const actions = select('.boxed-group-action', repoNotificationContainer);
		const firstActionButton = select('button', actions);

		const repo = select('.notifications-repo-link', repoNotificationContainer).textContent.split('/')[1];

		const openNotificationsButton = (
			<button type="button" class="open-repo-notifications js-open-repo-notifications" aria-label={`Open all ${repo} notifications in tabs`}>
				{icons.externalLink()}
			</button>
		);

		openNotificationsButton.addEventListener('click', event => {
			const button = event.target;
			const repo = button.closest('.boxed-group');

			tryOpeningNotifications(repo);
			repo.classList.add('hide-notification-actions');
		});

		actions.insertBefore(openNotificationsButton, firstActionButton);
	}
}

function addOpenAllButton() {
	if (!select.exists('#open-all-tabs-trigger')) {
		// Move out the extra node that messes with .BtnGroup-item:last-child
		document.body.append(select('#mark_as_read_confirm_box') || '');

		// Create an open button and add it into a button group
		const group = select('.tabnav .float-right');
		group.prepend(
			<a href="#open-all-in-tabs" id="open-all-tabs-trigger" class="btn btn-sm">Open all unread in tabs</a>
		);
		groupButtons([...group.children]);
	}
}

function addConfirmationBox() {
	if (!select.exists('#open-all-in-tabs')) {
		document.body.append(
			<div id="open-all-in-tabs" style={{display: 'none'}}>
				{faceboxTrigger}

				<h2 class="facebox-header" data-facebox-id="facebox-header">Are you sure?</h2>

				<p data-facebox-id="facebox-description"></p>

				<div class="full-button">
					<button class="btn btn-block" id="open-all-notifications">Open all notifications</button>
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

	delegate('#open-all-notifications', 'click', () => {
		openNotifications();
		select('.js-facebox-close').click(); // Close modal
	});
	delegate('#open-all-tabs-trigger', 'click', () => {
		tryOpeningNotifications();
	});

	gitHubInjection(() => {
		// Add support for Mark as Unread
		observeEl(
			select('.notifications-list') || select('.js-navigation-container'),
			addMarkup
		);
	});
}
