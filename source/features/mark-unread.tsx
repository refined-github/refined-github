import './mark-unread.css';
import delay from 'delay';
import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import elementReady from 'element-ready';
import XIcon from 'octicon/x.svg';
import InfoIcon from 'octicon/info.svg';
import CheckIcon from 'octicon/check.svg';
import MergeIcon from 'octicon/git-merge.svg';
import IssueOpenedIcon from 'octicon/issue-opened.svg';
import IssueClosedIcon from 'octicon/issue-closed.svg';
import PullRequestIcon from 'octicon/git-pull-request.svg';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';
import onReplacedElement from '../libs/on-replaced-element';
import {getUsername, getRepoURL, logError} from '../libs/utils';

type NotificationType = 'pull-request' | 'issue';
type NotificationState = 'open' | 'merged' | 'closed' | 'draft';

interface Participant {
	username: string;
	avatar: string;
}

interface Notification {
	participants: Participant[];
	state: NotificationState;
	isParticipating: boolean;
	repository: string;
	title: string;
	type: NotificationType;
	date: string;
	url: string;
}

const listeners: delegate.Subscription[] = [];
const stateIcons = {
	issue: {
		open: IssueOpenedIcon,
		closed: IssueClosedIcon,
		merged: IssueClosedIcon, // Required just for TypeScript
		draft: IssueOpenedIcon // Required just for TypeScript
	},
	'pull-request': {
		open: PullRequestIcon,
		closed: PullRequestIcon,
		merged: MergeIcon,
		draft: PullRequestIcon
	}
};

async function getNotifications(): Promise<Notification[]> {
	const {unreadNotifications} = await browser.storage.local.get({
		unreadNotifications: []
	});
	// Only show notifications for the current domain. Accounts for gist.github.com as well
	return unreadNotifications.filter(({url}: Notification) => location.hostname.endsWith(new URL(url).hostname));
}

async function setNotifications(unreadNotifications: Notification[]): Promise<void> {
	return browser.storage.local.set({unreadNotifications});
}

function stripHash(url: string): string {
	return url.replace(/#.+$/, '');
}

function addMarkUnreadButton(): void {
	if (!select.exists('.rgh-btn-mark-unread')) {
		select('.thread-subscription-status')!.after(
			<button className="btn btn-sm btn-block mt-2 rgh-btn-mark-unread" type="button">
				Mark as unread
			</button>
		);
	}
}

async function markRead(urls: string|string[]): Promise<void> {
	if (!Array.isArray(urls)) {
		urls = [urls];
	}

	const cleanUrls = urls.map(stripHash);

	for (const a of select.all<HTMLAnchorElement>('a.js-notification-target')) {
		if (cleanUrls.includes(a.getAttribute('href')!)) {
			a.closest('li.js-notification')!.classList.replace('unread', 'read');
		}
	}

	const notifications = await getNotifications();
	const updated = notifications.filter(({url}) => !cleanUrls.includes(url));
	await setNotifications(updated);
}

async function markUnread({delegateTarget}: delegate.Event): Promise<void> {
	const participants: Participant[] = select.all('.participant-avatar').slice(0, 3).map(element => ({
		username: element.getAttribute('aria-label')!,
		avatar: element.querySelector('img')!.src
	}));

	const stateLabel = select('.gh-header-meta .State')!;
	let state: NotificationState;

	if (stateLabel.classList.contains('State--green')) {
		state = 'open';
	} else if (stateLabel.classList.contains('State--purple')) {
		state = 'merged';
	} else if (stateLabel.classList.contains('State--red')) {
		state = 'closed';
	} else if (stateLabel.title.includes('Draft')) {
		state = 'draft';
	} else {
		logError(__filebasename, 'A new issue state was introduced?');
		return;
	}

	const lastCommentTime = select.last<HTMLTimeElement>('.timeline-comment-header relative-time')!;
	const unreadNotifications = await getNotifications();

	unreadNotifications.push({
		participants,
		state,
		isParticipating: select.exists(`.participant-avatar[href="/${getUsername()}"]`),
		repository: getRepoURL(),
		title: select('.js-issue-title')!.textContent!.trim(),
		type: pageDetect.isPR() ? 'pull-request' : 'issue',
		date: lastCommentTime.getAttribute('datetime')!,
		url: stripHash(location.href)
	});

	await setNotifications(unreadNotifications);
	await updateUnreadIndicator();

	delegateTarget.setAttribute('disabled', 'disabled');
	delegateTarget.textContent = 'Marked as unread';
}

function getNotification(notification: Notification): Element {
	const {
		participants,
		title,
		state,
		type,
		date,
		url
	} = notification;

	const existing = select(`a.js-notification-target[href^="${stripHash(url)}"]`);
	if (existing) {
		const item = existing.closest('.js-notification')!;
		item.classList.replace('read', 'unread');
		return item;
	}

	const usernames = participants
		.map(participant => participant.username)
		.join(' and ')
		.replace(/ and (.+) and/, ', $1, and'); // 3 people only: A, B, and C

	const avatars = participants.map(participant => (
		<a href={`/${participant.username}`} className="avatar">
			<img alt={`@${participant.username}`} height="20" src={participant.avatar} width="20"/>
		</a>
	));

	return (
		<li className={`list-group-item js-notification js-navigation-item unread ${type}-notification rgh-unread`}>
			<span className="list-group-item-name css-truncate">
				<span className={`type-icon type-icon-state-${state}`}>
					{stateIcons[type][state]()}
				</span>
				<a
					className="css-truncate-target js-notification-target js-navigation-open list-group-item-link"
					href={url}
					data-hovercard-url={`${url}/hovercard?show_subscription_status=true`}
				>
					{title}
				</a>
			</span>
			<ul className="notification-actions">
				<li className="delete">
					<button className="btn-link delete-note" type="button">
						<CheckIcon/>
					</button>
				</li>
				<li className="mute tooltipped tooltipped-w" aria-label={`${type === 'issue' ? 'Issue' : 'PR'} manually marked as unread`}>
					<InfoIcon/>
				</li>
				<li className="age">
					<relative-time datetime={date}/>
				</li>
				<div className="AvatarStack AvatarStack--three-plus AvatarStack--right clearfix d-inline-block" style={{marginTop: 1}}>
					<div className="AvatarStack-body tooltipped tooltipped-sw tooltipped-align-right-1" aria-label={usernames}>
						{avatars}
					</div>
				</div>
			</ul>
		</li>
	);
}

function getNotificationGroup({repository}: Notification): Element {
	const existing = select(`a.notifications-repo-link[title="${repository}"]`);
	if (existing) {
		return existing.closest('.boxed-group')!;
	}

	return (
		<div className="boxed-group flush">
			<form className="boxed-group-action">
				<button className="mark-all-as-read css-truncate js-mark-all-read" type="button">
					<CheckIcon/>
				</button>
			</form>

			<h3>
				<a href={'/' + repository} className="css-truncate css-truncate-target notifications-repo-link" title={repository}>
					{repository}
				</a>
			</h3>

			<ul className="boxed-group-inner list-group notifications"/>
		</div>
	);
}

async function renderNotifications(unreadNotifications: Notification[]): Promise<void> {
	unreadNotifications = unreadNotifications.filter(shouldNotificationAppearHere);

	if (unreadNotifications.length === 0) {
		return;
	}

	// Don’t simplify selector, it’s for cross-extension compatibility
	let pageList = (await elementReady('#notification-center .notifications-list'))!;

	if (!pageList) {
		pageList = <div className="notifications-list"/>;
		select('.blankslate')!.replaceWith(pageList);
	}

	unreadNotifications.reverse().forEach(notification => {
		const group = getNotificationGroup(notification);
		const item = getNotification(notification);

		pageList.prepend(group);
		group
			.querySelector('ul.notifications')!
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

function shouldNotificationAppearHere(notification: Notification): boolean {
	if (isSingleRepoPage()) {
		return isCurrentSingleRepoPage(notification);
	}

	if (isParticipatingPage()) {
		return notification.isParticipating;
	}

	return true;
}

function isSingleRepoPage(): boolean {
	return location.pathname.split('/')[3] === 'notifications';
}

function isCurrentSingleRepoPage({repository}: Notification): boolean {
	const singleRepo = /^\/(.+\/.+)\/notifications/.exec(location.pathname)?.[1];
	return singleRepo === repository;
}

function isParticipatingPage(): boolean {
	return location.pathname.startsWith('/notifications/participating');
}

async function updateUnreadIndicator(): Promise<void> {
	await delay(200); // Lets `markRead` run first. It can't be added to this function

	const icon = select<HTMLAnchorElement>('a.notification-indicator')!; // "a" required in responsive views
	const statusMark = icon.querySelector('.mail-status')!;

	const hasRealNotifications = icon.matches('[data-ga-click$=":unread"]');
	const rghUnreadCount = (await getNotifications()).length;

	const hasUnread = hasRealNotifications || rghUnreadCount > 0;
	const label = hasUnread ? 'You have unread notifications' : 'You have no unread notifications';

	icon.setAttribute('aria-label', label);
	statusMark.classList.toggle('unread', hasUnread);

	if (rghUnreadCount > 0) {
		icon.dataset.rghUnread = String(rghUnreadCount); // Store in attribute to let other extensions know
	} else {
		delete icon.dataset.rghUnread;
	}
}

async function markNotificationRead({delegateTarget}: delegate.Event): Promise<void> {
	const {href} = delegateTarget
		.closest('li.js-notification')!
		.querySelector<HTMLAnchorElement>('a.js-notification-target')!;
	await markRead(href);
	await updateUnreadIndicator();
}

async function markAllNotificationsRead(event: delegate.Event): Promise<void> {
	event.preventDefault();
	const repoGroup = event.delegateTarget.closest('.boxed-group')!;
	const urls = select.all<HTMLAnchorElement>('a.js-notification-target', repoGroup).map(a => a.href);
	await markRead(urls);
	await updateUnreadIndicator();
}

async function markVisibleNotificationsRead({delegateTarget}: delegate.Event): Promise<void> {
	const group = delegateTarget.closest('.boxed-group')!;
	const repo = select('.notifications-repo-link', group)!.textContent;
	const notifications = await getNotifications();
	setNotifications(notifications.filter(({repository}) => repository !== repo));
}

function addCustomAllReadButton(): void {
	const nativeMarkUnreadForm = select('details [action="/notifications/mark"]');
	if (nativeMarkUnreadForm) {
		nativeMarkUnreadForm.addEventListener('submit', () => {
			setNotifications([]);
		});
		return;
	}

	select('.tabnav .float-right')!.append(
		<details className="details-reset details-overlay details-overlay-dark lh-default text-gray-dark d-inline-block text-left">
			<summary className="btn btn-sm" aria-haspopup="dialog">
				Mark all as read
			</summary>
			<details-dialog className="Box Box--overlay d-flex flex-column anim-fade-in fast " aria-label="Are you sure?" role="dialog" tabindex="-1">
				<div className="Box-header">
					<button className="Box-btn-octicon btn-octicon float-right" type="button" aria-label="Close dialog" data-close-dialog="">
						<XIcon/>
					</button>
					<h3 className="Box-title">Are you sure?</h3>
				</div>

				<div className="Box-body">
					<p>Are you sure you want to mark all unread notifications as read?</p>
					<button type="button" className="btn btn-block" id="clear-local-notification">Mark all notifications as read</button>
				</div>
			</details-dialog>
		</details>
	);

	delegate(document, '#clear-local-notification', 'click', async () => {
		await setNotifications([]);
		location.reload();
	});
}

function updateLocalNotificationsCount(localNotifications: Notification[]): void {
	const unreadCount = select('#notification-center .filter-list a[href="/notifications"] .count')!;
	const githubNotificationsCount = Number(unreadCount.textContent);
	unreadCount.textContent = String(githubNotificationsCount + localNotifications.length);
}

function updateLocalParticipatingCount(notifications: Notification[]): void {
	const participatingNotifications = notifications
		.filter(({isParticipating}) => isParticipating)
		.length;

	if (participatingNotifications > 0) {
		const unreadCount = select('#notification-center .filter-list a[href="/notifications/participating"] .count')!;
		const githubNotificationsCount = Number(unreadCount.textContent);
		unreadCount.textContent = String(githubNotificationsCount + participatingNotifications);
	}
}

async function initDiscussionListPage(): Promise<void> {
	for (const discussion of await getNotifications()) {
		const {pathname} = new URL(discussion.url);
		select(`[href='${pathname}']`)!.closest('.Box-row')!.classList.add('Box-row--unread');
	}
}

function initDiscussionPage(): void {
	markRead(location.href);

	addMarkUnreadButton();
	onReplacedElement('#partial-discussion-sidebar', addMarkUnreadButton);
	delegate(document, '.rgh-btn-mark-unread', 'click', markUnread);
}

async function initNotificationsPage(): Promise<void> {
	const notifications = await getNotifications();
	if (notifications.length > 0) {
		await renderNotifications(notifications);
		addCustomAllReadButton();
		updateLocalNotificationsCount(notifications);
		updateLocalParticipatingCount(notifications);
		document.dispatchEvent(new CustomEvent('refined-github:mark-unread:notifications-added'));
	}

	listeners.push(
		delegate(document, '.btn-link.delete-note', 'click', markNotificationRead),
		delegate(document, '.js-mark-all-read', 'click', markAllNotificationsRead),
		delegate(document, '.js-delete-notification button', 'click', updateUnreadIndicator),
		delegate(document, '.js-mark-visible-as-read', 'submit', markVisibleNotificationsRead)
	);
}

function deinitNotificationsPage(): void {
	for (const listener of listeners) {
		listener.destroy();
	}

	listeners.length = 0;
}

features.add({
	disabled: '#2801',
	id: __filebasename,
	description: 'Adds button to mark issues and PRs as unread. They will reappear in Notifications.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/27847663-963b7d7c-6171-11e7-9470-6e86d8463771.png'
}, {
	include: [
		pageDetect.isNotifications
	],
	init: initNotificationsPage,
	deinit: deinitNotificationsPage
}, {
	include: [
		pageDetect.isPRConversation,
		pageDetect.isIssue
	],
	init: initDiscussionPage
}, {
	include: [
		pageDetect.isDiscussionList
	],
	init: initDiscussionListPage
}, {
	repeatOnAjax: false,
	init: updateUnreadIndicator
});
