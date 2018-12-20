import {h} from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate';
import domLoaded from 'dom-loaded';
import gitHubInjection from 'github-injection';
import observeEl from '../libs/simplified-element-observer';
import * as icons from '../libs/icons';
import * as pageDetect from '../libs/page-detect';
import {getUsername, safeElementReady} from '../libs/utils';

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

async function getNotifications() {
	const {unreadNotifications} = await browser.storage.local.get({
		unreadNotifications: []
	});
	return unreadNotifications;
}

function setNotifications(unreadNotifications) {
	return browser.storage.local.set({unreadNotifications});
}

function stripHash(url) {
	return url.replace(/#.+$/, '');
}

function addMarkUnreadButton() {
	const container = select('.js-thread-subscription-status');
	if (container && !select.exists('.rgh-btn-mark-unread')) {
		const button = <button class="btn btn-sm rgh-btn-mark-unread">Mark as unread</button>;
		button.addEventListener('click', markUnread, {
			once: true
		});
		container.after(button);
	}
}

async function markRead(urls) {
	if (!Array.isArray(urls)) {
		urls = [urls];
	}
	const cleanUrls = urls.map(stripHash);

	for (const a of select.all('a.js-notification-target')) {
		if (cleanUrls.includes(a.getAttribute('href'))) {
			a.closest('li.js-notification').classList.replace('unread', 'read');
		}
	}

	const notifications = await getNotifications();
	const updated = notifications.filter(({url}) => !cleanUrls.includes(url));
	await setNotifications(updated);
}

async function markUnread() {
	const participants = select.all('.participant-avatar').slice(0, 3).map(el => ({
		username: el.getAttribute('aria-label'),
		avatar: el.querySelector('img').src
	}));

	const {ownerName, repoName} = pageDetect.getOwnerAndRepo();
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
	const unreadNotifications = await getNotifications();

	unreadNotifications.push({
		participants,
		state,
		isParticipating: select.exists(`.participant-avatar[href="/${getUsername()}"]`),
		repository: `${ownerName}/${repoName}`,
		dateTitle: lastCommentTime.title,
		title: select('.js-issue-title').textContent.trim(),
		type: pageDetect.isPR() ? 'pull-request' : 'issue',
		date: lastCommentTime.getAttribute('datetime'),
		url: stripHash(location.href)
	});

	await setNotifications(unreadNotifications);
	await updateUnreadIndicator();

	this.setAttribute('disabled', 'disabled');
	this.textContent = 'Marked as unread';
}

function getNotification(notification) {
	const {
		participants,
		dateTitle,
		title,
		state,
		type,
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

async function renderNotifications(unreadNotifications) {
	unreadNotifications = unreadNotifications.filter(shouldNotificationAppearHere);

	if (unreadNotifications.length === 0) {
		return;
	}

	// Don’t simplify selector, it’s for cross-extension compatibility
	let pageList = await safeElementReady('#notification-center .notifications-list');

	if (!pageList) {
		pageList = <div class="notifications-list"></div>;
		select('.blankslate').replaceWith(pageList);
	}

	unreadNotifications.reverse().forEach(notification => {
		const group = getNotificationGroup(notification);
		const item = getNotification(notification);

		pageList.prepend(group);
		group
			.querySelector('ul.notifications')
			.prepend(item);
	});

	// Make sure that all the boxes with unread items are at the top
	// This is necessary in the "All notifications" view
	for (const repo of select.all('.boxed-group').reverse()) {
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
		return notification.isParticipating;
	}
	return true;
}

function isSingleRepoPage() {
	return location.pathname.split('/')[3] === 'notifications';
}

function isCurrentSingleRepoPage({repository}) {
	const [, singleRepo] = /^[/](.+[/].+)[/]notifications/.exec(location.pathname) || [];
	return singleRepo === repository;
}

function isParticipatingPage() {
	return /\/notifications\/participating/.test(location.pathname);
}

async function updateUnreadIndicator() {
	const icon = select('a.notification-indicator'); // "a" required in responsive views
	if (!icon) {
		return;
	}
	const statusMark = icon.querySelector('.mail-status');
	const hasRealNotifications = icon.matches('[data-ga-click$=":unread"]');
	const rghUnreadCount = (await getNotifications()).length;

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

async function markNotificationRead({target}) {
	const {href} = target
		.closest('li.js-notification')
		.querySelector('a.js-notification-target');
	await markRead(href);
	await updateUnreadIndicator();
}

async function markAllNotificationsRead(event) {
	event.preventDefault();
	const repoGroup = event.target.closest('.boxed-group');
	const urls = select.all('a.js-notification-target', repoGroup).map(a => a.href);
	await markRead(urls);
	await updateUnreadIndicator();
}

function addCustomAllReadBtn() {
	const nativeMarkUnreadForm = select('details [action="/notifications/mark"]');
	if (nativeMarkUnreadForm) {
		nativeMarkUnreadForm.addEventListener('submit', () => {
			setNotifications([]);
		});
		return;
	}

	select('.tabnav .float-right').append(
		<details class="details-reset details-overlay details-overlay-dark lh-default text-gray-dark d-inline-block text-left">
			<summary class="btn btn-sm" aria-haspopup="dialog">
				Mark all as read
			</summary>
			<details-dialog class="Box Box--overlay d-flex flex-column anim-fade-in fast " aria-label="Are you sure?" role="dialog" tabindex="-1">
				<div class="Box-header">
					<button class="Box-btn-octicon btn-octicon float-right" type="button" aria-label="Close dialog" data-close-dialog="">
						{icons.x()}
					</button>
					<h3 class="Box-title">Are you sure?</h3>
				</div>

				<div class="Box-body">
					<p>Are you sure you want to mark all unread notifications as read?</p>
					<button type="button" class="btn btn-block" id="clear-local-notification">Mark all notifications as read</button>
				</div>
			</details-dialog>
		</details>
	);

	delegate('#clear-local-notification', 'click', async () => {
		await setNotifications([]);
		location.reload();
	});
}
function updateLocalNotificationsCount(localNotifications) {
	const unreadCount = select('#notification-center .filter-list a[href="/notifications"] .count');
	const githubNotificationsCount = Number(unreadCount.textContent);
	unreadCount.textContent = githubNotificationsCount + localNotifications.length;
}

function updateLocalParticipatingCount(notifications) {
	const participatingNotifications = notifications
		.filter(({isParticipating}) => isParticipating)
		.length;

	if (participatingNotifications > 0) {
		const unreadCount = select('#notification-center .filter-list a[href="/notifications/participating"] .count');
		const githubNotificationsCount = Number(unreadCount.textContent);
		unreadCount.textContent = githubNotificationsCount + participatingNotifications;
	}
}
function destroy() {
	for (const listener of listeners) {
		listener.destroy();
	}
	listeners.length = 0;
}

export default function () {
	gitHubInjection(async () => {
		destroy();

		if (pageDetect.isNotifications()) {
			const notifications = await getNotifications();
			if (notifications.length > 0) {
				await renderNotifications(notifications);
				addCustomAllReadBtn();
				updateLocalNotificationsCount(notifications);
				updateLocalParticipatingCount(notifications);
			}
			listeners.push(
				delegate('.btn-link.delete-note', 'click', markNotificationRead),
				delegate('.js-mark-all-read', 'click', markAllNotificationsRead),
				delegate('.js-delete-notification button', 'click', updateUnreadIndicator),
				delegate('.js-mark-visible-as-read', 'submit', async event => {
					const group = event.target.closest('.boxed-group');
					const repo = select('.notifications-repo-link', group).textContent;
					const notifications = await getNotifications();
					setNotifications(notifications.filter(({repository}) => repository !== repo));
				})
			);
		} else if (pageDetect.isPR() || pageDetect.isIssue()) {
			await domLoaded;
			await markRead(location.href);

			// The sidebar changes when new comments are added or the issue status changes
			observeEl('.discussion-sidebar', addMarkUnreadButton);
		} else if (pageDetect.isIssueList()) {
			await domLoaded;
			for (const discussion of await getNotifications()) {
				const {pathname} = new URL(discussion.url);
				const listItem = select(`.read [href='${pathname}']`);
				if (listItem) {
					listItem.closest('.read').classList.replace('read', 'unread');
				}
			}
		}

		await updateUnreadIndicator();
	});
}
