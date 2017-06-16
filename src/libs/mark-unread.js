import select from 'select-dom';
import $ from './vendor/jquery.slim.min';
import * as icons from './icons';
import * as pageDetect from './page-detect';

function loadNotifications() {
	return JSON.parse(localStorage.getItem('unreadNotifications') || '[]');
}

function storeNotifications(unreadNotifications) {
	localStorage.setItem('unreadNotifications', JSON.stringify(unreadNotifications || '[]'));
}

function stripHash(url) {
	return url.replace(/#.+$/, '');
}

function addMarkUnreadButton() {
	$('<button class="btn btn-sm btn-mark-unread js-mark-unread">Mark as unread</button>')
		.appendTo('.js-thread-subscription-status');
}

function markRead(url) {
	const unreadNotifications = loadNotifications();
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

	storeNotifications(unreadNotifications);
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

	const unreadNotifications = loadNotifications();

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

	storeNotifications(unreadNotifications);
	unreadIndicatorIcon();

	this.setAttribute('disabled', 'disabled');
	this.textContent = 'Marked as unread';
}

function renderNotifications() {
	const unreadNotifications = loadNotifications()
		.filter(notification => !isNotificationExist(notification.url))
		.filter(notification => {
			if (!isParticipatingPage()) {
				return true;
			}

			const {participants} = notification;
			const myUserName = getUserName();

			return participants
				.filter(participant => participant.username === myUserName)
				.length > 0;
		});

	if (unreadNotifications.length === 0) {
		return;
	}

	if (isEmptyPage()) {
		select('.blankslate').remove();
		$('.js-navigation-container').append('<div class="notifications-list"></div>');
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
				icon = icons.openIssue;
			}

			if (state === 'closed') {
				icon = icons.closedIssue;
			}
		}

		if (type === 'pull-request') {
			if (state === 'open') {
				icon = icons.openPullRequest;
			}

			if (state === 'merged') {
				icon = icons.mergedPullRequest;
			}

			if (state === 'closed') {
				icon = icons.closedPullRequest;
			}
		}

		const hasList = select.exists(`a.notifications-repo-link[title="${repository}"]`);
		if (!hasList) {
			const list = $(`
				<div class="boxed-group flush">
					<form class="boxed-group-action">
						<button class="mark-all-as-read css-truncate tooltipped tooltipped-w js-mark-all-read" aria-label="Mark all notifications as read">
							${icons.check}
						</button>
					</form>
					<h3>
						<a href="/${repository}" class="css-truncate css-truncate-target notifications-repo-link" title="${repository}">
							${repository}
						</a>
					</h3>
					<ul class="boxed-group-inner list-group notifications"></ul>
				</div>
			`);

			$('.notifications-list').prepend(list);
		}

		const list = $(`a.notifications-repo-link[title="${repository}"]`).parent().siblings('ul.notifications');

		const usernames = participants
			.map(participant => participant.username)
			.join(', ');

		const avatars = participants
			.map(participant => {
				return `
					<img alt="@${participant.username}" class="avatar from-avatar" src="${participant.avatar}" width="39" height="39">
				`;
			})
			.join('');

		const item = $(`
			<li class="list-group-item js-notification js-navigation-item unread ${type}-notification">
				<span class="list-group-item-name css-truncate">
					${icon}
					<a class="css-truncate-target js-notification-target js-navigation-open list-group-item-link" href="${url}">
						${title}
					</a>
				</span>
				<ul class="notification-actions">
					<li class="delete">
						<button aria-label="Mark as read" class="btn-link delete-note tooltipped tooltipped-w js-mark-read">
							${icons.check}
						</button>
					</li>
					<li class="mute">
						<button style="opacity: 0; pointer-events: none;">
							${icons.mute}
						</button>
					</li>
					<li class="age">
						<relative-time datetime="${date}" title="${dateTitle}"></relative-time>
					</li>
					<li class="tooltipped tooltipped-s" aria-label="${usernames}">
						<div class="avatar-stack clearfix">
							${avatars}
						</div>
					</li>
				</ul>
			</li>
		`);

		list.prepend(item);
	});
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

function getUserName() {
	return select('#user-links a.name img').getAttribute('alt').slice(1);
}

function unreadIndicatorIcon() {
	const notificationIndicator = select('.header-nav-link.notification-indicator');
	const notificationStatus = notificationIndicator.querySelector('.mail-status');
	const hasUnread = loadNotifications().length > 0;
	const label = hasUnread ? 'You have unread notifications' : 'You have no unread notifications';

	notificationStatus.classList.toggle('unread', hasUnread);
	notificationIndicator.setAttribute('aria-label', label);
}

function markNotificationRead(e) {
	const notification = e.target.closest('li.js-notification');
	const a = notification.querySelector('a.js-notification-target');
	markRead(a.href);
	unreadIndicatorIcon();
}

function markAllNotificationsRead(e) {
	e.preventDefault();
	const repoGroup = e.target.closest('.boxed-group');
	for (const a of repoGroup.querySelectorAll('a.js-notification-target')) {
		markRead(a.href);
	}
	unreadIndicatorIcon();
}

function addCustomAllReadBtn() {
	const hasMarkAllReadBtnExists = select.exists('#notification-center a[href="#mark_as_read_confirm_box"]');
	if (hasMarkAllReadBtnExists || loadNotifications().length === 0) {
		return;
	}

	$('#notification-center .tabnav-tabs:first').append(`
		<div class="float-right">
		    <a href="#mark_as_read_confirm_box" class="btn btn-sm " rel="facebox">Mark all as read</a>
  			<div id="mark_as_read_confirm_box" style="display:none">
        		<h2 class="facebox-header" data-facebox-id="facebox-header">Are you sure?</h2>
        		<p data-facebox-id="facebox-description">Are you sure you want to mark all unread notifications as read?</p>
            	<div class="full-button">
                	<button  id="clear-local-notification" class="btn btn-block">Mark all notifications as read</button>
            	</div>
  			</div>
  		</div>`);

	$(document).on('click', '#clear-local-notification', () => {
		storeNotifications([]);
		location.reload();
	});
}

function countLocalNotifications() {
	const unreadCount = select('#notification-center .filter-list a[href="/notifications"] .count');
	const githubNotificationsCount = Number(unreadCount.textContent);
	const localNotifications = loadNotifications();

	if (localNotifications) {
		unreadCount.textContent = githubNotificationsCount + localNotifications.length;
	}
}

function setup() {
	if (pageDetect.isNotifications()) {
		renderNotifications();
		addCustomAllReadBtn();
		countLocalNotifications();
		$(document).on('click', '.js-mark-read', markNotificationRead);
		$(document).on('click', '.js-mark-all-read', markAllNotificationsRead);
		$(document).on('click', 'form[action="/notifications/mark"] button', () => {
			storeNotifications([]);
		});
	} else {
		markRead(location.href);
		addMarkUnreadButton();
		$(document).one('click', '.js-mark-unread', markUnread);
	}
}

function destroy() {
	$(document).off('click', '.js-mark-unread', markUnread);
	$('.js-mark-unread').remove();
}

export default {
	setup,
	destroy,
	unreadIndicatorIcon
};
