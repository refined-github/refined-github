import browser from 'webextension-polyfill';
import gitHubInjection from 'github-injection';
import select from 'select-dom';
import {h} from 'dom-chef';
import SynchronousStorage from '../libs/synchronous-storage';
import * as icons from '../libs/icons';
import * as pageDetect from '../libs/page-detect';
import {getUsername} from '../libs/utils';

let storage;

function stripHash(url) {
	return url.replace(/#.+$/, '');
}

function addMarkUnreadButton() {
	const container = select('.js-thread-subscription-status');
	if (container) {
		const button = <button class="btn btn-sm btn-mark-unread js-mark-unread">Mark as unread</button>;
		button.addEventListener('click', markUnread, {
			once: true
		});
		container.append(button);
	}
}

function markRead(url) {
	const unreadNotifications = storage.get();
	unreadNotifications.forEach((notification, index) => {
		if (notification.url === url) {
			unreadNotifications.splice(index, 1);
		}
	});

	for (const a of select.all(`a.js-notification-target[href="${url}"]`)) {
		const li = a.closest('li.js-notification');
		li.classList.remove('unread');
		li.classList.add('read');
	}

	storage.set(unreadNotifications);
}

function markUnread() {
	const participants = select.all('.participant-avatar').map(el => ({
		username: el.getAttribute('aria-label'),
		avatar: el.querySelector('img').src
	}));

	const {ownerName, repoName} = pageDetect.getOwnerAndRepo();
	const repository = `${ownerName}/${repoName}`;
	const title = select('.js-issue-title').textContent.trim();
	const type = pageDetect.isPR() ? 'pull-request' : 'issue';
	const url = stripHash(location.href);

	const stateLabel = select('.gh-header-meta .State');
	let state;

	if (stateLabel.classList.contains('State--green')) {
		state = 'open';
	} else if (stateLabel.classList.contains('State--purple')) {
		state = 'merged';
	} else if (stateLabel.classList.contains('State--red')) {
		state = 'closed';
	}

	const lastCommentTime = select.all('.timeline-comment-header relative-time').pop();
	const dateTitle = lastCommentTime.title;
	const date = lastCommentTime.getAttribute('datetime');

	const unreadNotifications = storage.get();

	unreadNotifications.push({
		participants,
		repository,
		title,
		state,
		type,
		dateTitle,
		date,
		url
	});

	storage.set(unreadNotifications);
	updateUnreadIndicator();

	this.setAttribute('disabled', 'disabled');
	this.textContent = 'Marked as unread';
}

function renderNotifications() {
	const myUserName = getUsername();
	const unreadNotifications = storage.get()
		.filter(notification => !isNotificationExist(notification.url))
		.filter(notification => {
			if (!isParticipatingPage()) {
				return true;
			}

			return isParticipatingNotification(notification, myUserName);
		});

	if (unreadNotifications.length === 0) {
		return;
	}

	if (isEmptyPage()) {
		select('.blankslate').remove();
		select('.js-navigation-container').append(<div class="notifications-list"></div>);
	}

	unreadNotifications.forEach(notification => {
		const {
			participants,
			repository,
			title,
			state,
			type,
			dateTitle,
			date,
			url
		} = notification;

		let icon;

		if (type === 'issue') {
			if (state === 'open') {
				icon = icons.openIssue();
			}

			if (state === 'closed') {
				icon = icons.closedIssue();
			}
		}

		if (type === 'pull-request') {
			if (state === 'open') {
				icon = icons.openPullRequest();
			}

			if (state === 'merged') {
				icon = icons.mergedPullRequest();
			}

			if (state === 'closed') {
				icon = icons.closedPullRequest();
			}
		}

		const hasList = select.exists(`a.notifications-repo-link[title="${repository}"]`);
		if (!hasList) {
			const list = (
				<div class="boxed-group flush">
					<form class="boxed-group-action">
						<button class="mark-all-as-read css-truncate js-mark-all-read">
							{icons.check()}
						</button>
					</form>

					<h3>
						<a href={'/' + repository} class="css-truncate css-truncate-target notifications-repo-link" title={repository}>
							{repository}
						</a>
					</h3>

					<ul class="boxed-group-inner list-group notifications"/>
				</div>
			);

			$('.notifications-list').prepend(list);
		}

		const list = $(`a.notifications-repo-link[title="${repository}"]`).parent().siblings('ul.notifications');

		const usernames = participants
			.map(participant => participant.username)
			.join(', ');

		const avatars = participants
			.map(participant => {
				return <img alt={`@${participant.username}`} class="avatar from-avatar" src={participant.avatar} width={39} height={39}/>;
			});

		const item = (
			<li class={`list-group-item js-notification js-navigation-item unread ${type}-notification`}>
				<span class="list-group-item-name css-truncate">
					{icon}

					<a href={url} class="css-truncate-target js-notification-target js-navigation-open list-group-item-link">
						{title}
					</a>
				</span>

				<ul class="notification-actions">
					<li class="delete">
						<button class="btn-link delete-note js-mark-read">
							{icons.check()}
						</button>
					</li>

					<li class="mute">
						<button style={{opacity: 0, pointerEvents: 'none'}}>
							{icons.mute()}
						</button>
					</li>

					<li class="age">
						<relative-time datetime={date} title={dateTitle}/>
					</li>

					<li class="tooltipped tooltipped-s" aria-label={usernames}>
						<div class="avatar-stack clearfix">
							{avatars}
						</div>
					</li>
				</ul>
			</li>
		);

		list.prepend(item);
	});

	// Make sure that all the boxes with unread items are at the top
	// This is necessary in the "All notifications" view
	$('.boxed-group:has(".unread")').prependTo('.notifications-list');
}

function isNotificationExist(url) {
	return select.exists(`a.js-notification-target[href^="${stripHash(url)}"]`);
}

function isEmptyPage() {
	return select.exists('.blankslate');
}

function isParticipatingPage() {
	return /\/notifications\/participating/.test(location.pathname);
}

function isParticipatingNotification(notification, myUserName) {
	const {participants} = notification;

	return participants
		.filter(participant => participant.username === myUserName)
		.length > 0;
}

function updateUnreadIndicator() {
	const icon = select('.notification-indicator');
	if (!icon) {
		return;
	}
	const statusMark = icon.querySelector('.mail-status');
	const hasRealNotifications = icon.matches('[data-ga-click$=":unread"]');

	const hasUnread = hasRealNotifications || storage.get().length > 0;
	const label = hasUnread ? 'You have unread notifications' : 'You have no unread notifications';

	icon.setAttribute('aria-label', label);
	statusMark.classList.toggle('unread', hasUnread);
}

function markNotificationRead(e) {
	const notification = e.target.closest('li.js-notification');
	const a = notification.querySelector('a.js-notification-target');
	markRead(a.href);
	updateUnreadIndicator();
}

function markAllNotificationsRead(e) {
	e.preventDefault();
	const repoGroup = e.target.closest('.boxed-group');
	for (const a of repoGroup.querySelectorAll('a.js-notification-target')) {
		markRead(a.href);
	}
	updateUnreadIndicator();
}

function addCustomAllReadBtn() {
	const hasMarkAllReadBtnExists = select.exists('#notification-center a[href="#mark_as_read_confirm_box"]');
	if (hasMarkAllReadBtnExists || storage.get().length === 0) {
		return;
	}

	$('#notification-center .tabnav-tabs:first').append(
		<div class="float-right">
			<a href="#mark_as_read_confirm_box" class="btn btn-sm" rel="facebox">Mark all as read</a>

			<div id="mark_as_read_confirm_box" style={{display: 'none'}}>
				<h2 class="facebox-header" data-facebox-id="facebox-header">Are you sure?</h2>

				<p data-facebox-id="facebox-description">Are you sure you want to mark all unread notifications as read?</p>

				<div class="full-button">
					<button id="clear-local-notification" class="btn btn-block">Mark all notifications as read</button>
				</div>
			</div>
		</div>
	);

	$(document).on('click', '#clear-local-notification', () => {
		storage.set([]);
		location.reload();
	});
}

function updateLocalNotificationsCount() {
	const unreadCount = select('#notification-center .filter-list a[href="/notifications"] .count');
	const githubNotificationsCount = Number(unreadCount.textContent);
	const localNotifications = storage.get();

	if (localNotifications.length > 0) {
		unreadCount.textContent = githubNotificationsCount + localNotifications.length;
	}
}

function updateLocalParticipatingCount() {
	const unreadCount = select('#notification-center .filter-list a[href="/notifications/participating"] .count');
	const githubNotificationsCount = Number(unreadCount.textContent);
	const myUserName = getUsername();

	const participatingNotifications = storage.get()
		.filter(notification => isParticipatingNotification(notification, myUserName));

	if (participatingNotifications.length > 0) {
		unreadCount.textContent = githubNotificationsCount + participatingNotifications.length;
	}
}

async function setup() {
	storage = await new SynchronousStorage(
		() => {
			return browser.storage.local.get({
				unreadNotifications: []
			}).then(storage => storage.unreadNotifications);
		},
		unreadNotifications => {
			return browser.storage.local.set({unreadNotifications});
		}
	);
	gitHubInjection(() => {
		destroy();

		// Remove old data from previous storage
		// Drop code in 2018
		localStorage.removeItem('_unreadNotifications_migrated');
		localStorage.removeItem('unreadNotifications');

		if (pageDetect.isNotifications()) {
			renderNotifications();
			addCustomAllReadBtn();
			updateLocalNotificationsCount();
			updateLocalParticipatingCount();
			$(document).on('click', '.js-mark-read', markNotificationRead);
			$(document).on('click', '.js-mark-all-read', markAllNotificationsRead);
			$(document).on('click', '.js-delete-notification button', updateUnreadIndicator);
			$(document).on('click', 'form[action="/notifications/mark"] button', () => {
				storage.set([]);
			});
		} else if (pageDetect.isPR() || pageDetect.isIssue()) {
			markRead(location.href);
			addMarkUnreadButton();
		}

		updateUnreadIndicator();
	});
}

function destroy() {
	$(document).off('click', '.js-mark-unread', markUnread);
	$('.js-mark-unread').remove();
}

export default {
	setup,
	destroy
};
