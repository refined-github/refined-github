import {h} from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate';
import domLoaded from 'dom-loaded';
import gitHubInjection from 'github-injection';
import SynchronousStorage from '../libs/synchronous-storage';
import observeEl from '../libs/simplified-element-observer';
import * as icons from '../libs/icons';
import * as pageDetect from '../libs/page-detect';
import {getUsername} from '../libs/utils';

let storage;
const listeners = [];
const stateIcons = {
	issue: {
		open: icons.openIssue,
		closed: icons.closedIssue
	},
	'pull-request': {
		open: icons.openPullRequest,
		closed: icons.closedPullRequest,
		merged: icons.mergedPullRequest
	}
};

function stripHash(url) {
	return url.replace(/#.+$/, '');
}

function addMarkUnreadButton() {
	const container = select('.js-thread-subscription-status');
	if (container) {
		const button = <button class="btn btn-sm rgh-btn-mark-unread">Mark as unread</button>;
		button.addEventListener('click', markUnread, {
			once: true
		});
		container.after(button);
	}
}

function markRead(url) {
	const cleanUrl = stripHash(url);
	const unreadNotifications = storage.get();
	unreadNotifications.forEach((notification, index) => {
		if (notification.url === cleanUrl) {
			unreadNotifications.splice(index, 1);
		}
	});

	for (const a of select.all(`a.js-notification-target[href="${cleanUrl}"]`)) {
		const li = a.closest('li.js-notification');
		li.classList.remove('unread');
		li.classList.add('read');
	}

	storage.set(unreadNotifications);
}

function markUnread() {
	const participants = select.all('.participant-avatar').slice(0, 3).map(el => ({
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

function getNotification(notification) {
	const {
		participants,
		title,
		state,
		type,
		dateTitle,
		date,
		url
	} = notification;

	const existing = select(`a.js-notification-target[href^="${stripHash(url)}"]`);
	if (existing) {
		const item = existing.closest('.js-notification');
		item.classList.replace('read', 'unread');
		return item;
	}

	const usernames = participants
		.map(participant => participant.username)
		.join(' and ')
		.replace(/ and (.+) and/, ', $1, and'); // 3 people only: A, B, and C

	const avatars = participants.map(participant =>
		<a href={`/${participant.username}`} class="avatar">
			<img alt={`@${participant.username}`} height="20" src={participant.avatar} width="20"/>
		</a>
	);

	return (
		<li class={`list-group-item js-notification js-navigation-item unread ${type}-notification rgh-unread`}>
			<span class="list-group-item-name css-truncate">
				<span class={`type-icon type-icon-state-${state}`}>
					{stateIcons[type][state]()}
				</span>
				<a class="css-truncate-target js-notification-target js-navigation-open list-group-item-link" href={url}>
					{title}
				</a>
			</span>
			<ul class="notification-actions">
				<li class="delete">
					<button class="btn-link delete-note">
						{icons.check()}
					</button>
				</li>
				<li class="mute tooltipped tooltipped-w" aria-label={`${type === 'issue' ? 'Issue' : 'PR'} manually marked as unread`}>
					{icons.info()}
				</li>
				<li class="age">
					<relative-time datetime={date} title={dateTitle}/>
				</li>
				<div class="AvatarStack AvatarStack--three-plus AvatarStack--right clearfix d-inline-block" style={{marginTop: 1}}>
					<div class="AvatarStack-body tooltipped tooltipped-sw tooltipped-align-right-1" aria-label={usernames}>
						{avatars}
					</div>
				</div>
			</ul>
		</li>
	);
}

function getNotificationGroup({repository}) {
	const existing = select(`a.notifications-repo-link[title="${repository}"]`);
	if (existing) {
		return existing.closest('.boxed-group');
	}
	return (
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
}

function renderNotifications() {
	const unreadNotifications = storage.get()
		.filter(shouldNotificationAppearHere);

	if (unreadNotifications.length === 0) {
		return;
	}

	// Don’t simplify selector, it’s for cross-extension compatibility
	let pageList = select('#notification-center .notifications-list');

	if (!pageList) {
		pageList = <div class="notifications-list"></div>;
		select('.blankslate').replaceWith(pageList);
	}

	unreadNotifications.forEach(notification => {
		const group = getNotificationGroup(notification);
		const item = getNotification(notification);

		pageList.prepend(group);
		group
			.querySelector('ul.notifications')
			.prepend(item);
	});

	// Make sure that all the boxes with unread items are at the top
	// This is necessary in the "All notifications" view
	for (const repo of select.all('.boxed-group')) {
		if (select.exists('.unread', repo)) {
			pageList.prepend(repo);
		}
	}
}

function shouldNotificationAppearHere(notification) {
	if (isSingleRepoPage()) {
		return isCurrentSingleRepoPage(notification);
	}
	if (isParticipatingPage()) {
		return isParticipatingNotification(notification);
	}
	return true;
}

function isSingleRepoPage() {
	const [,,, subPage] = location.pathname.split('/');
	return subPage === 'notifications';
}

function isCurrentSingleRepoPage(notification) {
	const [, singleRepo] = /^[/](.+[/].+)[/]notifications/.exec(location.pathname) || [];
	return singleRepo === notification.repository;
}

function isParticipatingPage() {
	return /\/notifications\/participating/.test(location.pathname);
}

function isParticipatingNotification(notification) {
	const myUserName = getUsername();
	const {participants} = notification;

	return participants
		.filter(participant => participant.username === myUserName)
		.length > 0;
}

function updateUnreadIndicator() {
	const icon = select('a.notification-indicator'); // "a" required in responsive views
	if (!icon) {
		return;
	}
	const statusMark = icon.querySelector('.mail-status');
	const hasRealNotifications = icon.matches('[data-ga-click$=":unread"]');
	const rghUnreadCount = storage.get().length;

	const hasUnread = hasRealNotifications || rghUnreadCount > 0;
	const label = hasUnread ? 'You have unread notifications' : 'You have no unread notifications';

	icon.setAttribute('aria-label', label);
	statusMark.classList.toggle('unread', hasUnread);

	if (rghUnreadCount > 0) {
		icon.dataset.rghUnread = rghUnreadCount; // Store in attribute to let other extensions know
	} else {
		delete icon.dataset.rghUnread;
	}
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

	select('.tabnav .float-right').append(
		<a href="#mark_as_read_confirm_box" class="btn btn-sm" rel="facebox">Mark all as read</a>
	);
	document.body.append(
		<div id="mark_as_read_confirm_box" style={{display: 'none'}}>
			<h2 class="facebox-header" data-facebox-id="facebox-header">Are you sure?</h2>

			<p data-facebox-id="facebox-description">Are you sure you want to mark all unread notifications as read?</p>

			<div class="full-button">
				<button id="clear-local-notification" class="btn btn-block">Mark all notifications as read</button>
			</div>
		</div>
	);

	delegate('#clear-local-notification', 'click', () => {
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

	const participatingNotifications = storage.get()
		.filter(isParticipatingNotification);

	if (participatingNotifications.length > 0) {
		unreadCount.textContent = githubNotificationsCount + participatingNotifications.length;
	}
}

export default async function () {
	storage = await new SynchronousStorage(
		async () => {
			const storage = await browser.storage.local.get({
				unreadNotifications: []
			});
			return storage.unreadNotifications;
		},
		unreadNotifications => {
			return browser.storage.local.set({unreadNotifications});
		}
	);
	gitHubInjection(async () => {
		destroy();

		if (pageDetect.isNotifications()) {
			renderNotifications();
			addCustomAllReadBtn();
			updateLocalNotificationsCount();
			updateLocalParticipatingCount();
			listeners.push(
				delegate('.btn-link.delete-note', 'click', markNotificationRead),
				delegate('.js-mark-all-read', 'click', markAllNotificationsRead),
				delegate('.js-delete-notification button', 'click', updateUnreadIndicator),
				delegate('form[action="/notifications/mark"] button', 'click', e => {
					const group = e.target.closest('.boxed-group');
					const repo = select('.notifications-repo-link', group).textContent;
					storage.set(storage.get().filter(notification => notification.repository !== repo));
				})
			);
		} else if (pageDetect.isPR() || pageDetect.isIssue()) {
			markRead(location.href);

			// The sidebar changes when new comments are added or the issue status changes
			observeEl('.discussion-sidebar', addMarkUnreadButton);
		} else if (pageDetect.isIssueList()) {
			await domLoaded;
			for (const discussion of storage.get()) {
				const url = new URL(discussion.url);
				const listItem = select(`.read [href='${url.pathname}']`);
				if (listItem) {
					listItem.closest('.read').classList.replace('read', 'unread');
				}
			}
		}

		updateUnreadIndicator();
	});
}

function destroy() {
	for (const listener of listeners) {
		listener.destroy();
	}
	listeners.length = 0;
	for (const button of select.all('.rgh-btn-mark-unread')) {
		button.remove();
	}
}
