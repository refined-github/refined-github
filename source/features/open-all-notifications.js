import {h} from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate';
import observeEl from '../libs/simplified-element-observer';
import * as icons from '../libs/icons';
import {groupButtons, safeElementReady} from '../libs/utils';
import {isNotifications} from '../libs/page-detect';

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

	if (notificationsToOpen.length < 10) {
		openNotifications();
	} else {
		faceboxTrigger.click();
	}
}

function addOpenButtonsForRepos() {
	// Creating the open button for each repo
	const repoNotificationContainers = select.all('.boxed-group:not(.rgh-open-notifications)');

	for (const repoNotificationContainer of repoNotificationContainers) {
		repoNotificationContainer.classList.add('rgh-open-notifications');

		const unreadCount = select.all('.unread', repoNotificationContainer).length;
		if (unreadCount < 2) {
			return;
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

export default function () {
	if (!isNotifications() || select.exists('#open-all-tabs-trigger')) {
		return;
	}

	const unreadCount = select.all('.unread .js-notification-target').length;
	if (unreadCount < 2) {
		return;
	}

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

	delegate('#open-all-notifications', 'click', () => {
		openNotifications();
		select('.js-facebox-close').click(); // Close modal
	});

	// Create an open button and add it into a button group
	const group = select('.tabnav .float-right');
	group.prepend(
		<a href="#open-all-in-tabs" id="open-all-tabs-trigger" class="btn btn-sm">Open all unread in tabs</a>
	);
	groupButtons([...group.children]);

	delegate('#open-all-tabs-trigger', 'click', () => {
		tryOpeningNotifications();
	});

	// Move out the extra node that messes with .BtnGroup-item:last-child
	document.body.append(select('#mark_as_read_confirm_box') || '');

	// Add support for Mark as Unread
	observeEl('.notifications-list', addOpenButtonsForRepos);
}
