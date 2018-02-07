import {h} from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate';
import * as icons from '../libs/icons';
import {groupButtons, safeElementReady} from '../libs/utils';
import {isNotifications} from '../libs/page-detect';

const unreadNotificationsClass = '.unread .js-notification-target';
let notificationsToOpen = [];

const faceboxTrigger = (
	<a href="#open-all-in-tabs" id="facebox-trigger" rel="facebox" style={{display: 'none'}}></a>
);

function openNotifications(unreadNotifications = notificationsToOpen) {
	const urls = unreadNotifications.map(el => el.href);

	browser.runtime.sendMessage({
		urls,
		action: 'openAllInTabs'
	});

	for (const notification of unreadNotifications) {
		const listItem = notification.closest('.list-group-item');
		listItem.classList.add('read');
		listItem.classList.remove('unread');
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

export default function () {
	if (!isNotifications() || select.exists('[href="#open-all-in-tabs"]')) {
		return;
	}

	faceboxTrigger.addEventListener('click', async () => {
		await safeElementReady('#facebox-description');

		select('#facebox-description').textContent = `Are you sure you want to open ${notificationsToOpen.length} tabs?`;
	});

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

	// Creating the open button for each repo
	const repoNotificationContainers = select.all('.boxed-group');

	for (const repoNotificationContainer of repoNotificationContainers) {
		const actions = select('.boxed-group-action', repoNotificationContainer);
		const firstActionButton = select('button', actions);

		const repo = select('.notifications-repo-link', repoNotificationContainer).textContent.split('/')[1];

		const openNotificationsButton = (
			<button type="button" class="js-open-all-notifications" aria-label={`Open all ${repo} notifications in tabs`}>
				{icons.externalLink()}
			</button>
		);

		openNotificationsButton.addEventListener('click', () => {
			tryOpeningNotifications(repoNotificationContainer);
		});

		actions.insertBefore(openNotificationsButton, firstActionButton);
	}
}
