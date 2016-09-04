/* globals pageDetect */

'use strict';

const mergedPullRequestIcon = '<svg aria-label="pull request" class="octicon octicon-git-pull-request type-icon type-icon-state-merged" height="16" role="img" version="1.1" viewBox="0 0 12 16" width="12"><path d="M11 11.28V5c-.03-.78-.34-1.47-.94-2.06C9.46 2.35 8.78 2.03 8 2H7V0L4 3l3 3V4h1c.27.02.48.11.69.31.21.2.3.42.31.69v6.28A1.993 1.993 0 0 0 10 15a1.993 1.993 0 0 0 1-3.72zm-1 2.92c-.66 0-1.2-.55-1.2-1.2 0-.65.55-1.2 1.2-1.2.65 0 1.2.55 1.2 1.2 0 .65-.55 1.2-1.2 1.2zM4 3c0-1.11-.89-2-2-2a1.993 1.993 0 0 0-1 3.72v6.56A1.993 1.993 0 0 0 2 15a1.993 1.993 0 0 0 1-3.72V4.72c.59-.34 1-.98 1-1.72zm-.8 10c0 .66-.55 1.2-1.2 1.2-.65 0-1.2-.55-1.2-1.2 0-.65.55-1.2 1.2-1.2.65 0 1.2.55 1.2 1.2zM2 4.2C1.34 4.2.8 3.65.8 3c0-.65.55-1.2 1.2-1.2.65 0 1.2.55 1.2 1.2 0 .65-.55 1.2-1.2 1.2z"></path></svg>';
const closedPullRequestIcon = '<svg aria-label="pull request" class="octicon octicon-git-pull-request type-icon type-icon-state-closed" height="16" role="img" version="1.1" viewBox="0 0 12 16" width="12"><path d="M11 11.28V5c-.03-.78-.34-1.47-.94-2.06C9.46 2.35 8.78 2.03 8 2H7V0L4 3l3 3V4h1c.27.02.48.11.69.31.21.2.3.42.31.69v6.28A1.993 1.993 0 0 0 10 15a1.993 1.993 0 0 0 1-3.72zm-1 2.92c-.66 0-1.2-.55-1.2-1.2 0-.65.55-1.2 1.2-1.2.65 0 1.2.55 1.2 1.2 0 .65-.55 1.2-1.2 1.2zM4 3c0-1.11-.89-2-2-2a1.993 1.993 0 0 0-1 3.72v6.56A1.993 1.993 0 0 0 2 15a1.993 1.993 0 0 0 1-3.72V4.72c.59-.34 1-.98 1-1.72zm-.8 10c0 .66-.55 1.2-1.2 1.2-.65 0-1.2-.55-1.2-1.2 0-.65.55-1.2 1.2-1.2.65 0 1.2.55 1.2 1.2zM2 4.2C1.34 4.2.8 3.65.8 3c0-.65.55-1.2 1.2-1.2.65 0 1.2.55 1.2 1.2 0 .65-.55 1.2-1.2 1.2z"></path></svg>';
const openPullRequestIcon = '<svg aria-label="pull request" class="octicon octicon-git-pull-request type-icon type-icon-state-open" height="16" role="img" version="1.1" viewBox="0 0 12 16" width="12"><path d="M11 11.28V5c-.03-.78-.34-1.47-.94-2.06C9.46 2.35 8.78 2.03 8 2H7V0L4 3l3 3V4h1c.27.02.48.11.69.31.21.2.3.42.31.69v6.28A1.993 1.993 0 0 0 10 15a1.993 1.993 0 0 0 1-3.72zm-1 2.92c-.66 0-1.2-.55-1.2-1.2 0-.65.55-1.2 1.2-1.2.65 0 1.2.55 1.2 1.2 0 .65-.55 1.2-1.2 1.2zM4 3c0-1.11-.89-2-2-2a1.993 1.993 0 0 0-1 3.72v6.56A1.993 1.993 0 0 0 2 15a1.993 1.993 0 0 0 1-3.72V4.72c.59-.34 1-.98 1-1.72zm-.8 10c0 .66-.55 1.2-1.2 1.2-.65 0-1.2-.55-1.2-1.2 0-.65.55-1.2 1.2-1.2.65 0 1.2.55 1.2 1.2zM2 4.2C1.34 4.2.8 3.65.8 3c0-.65.55-1.2 1.2-1.2.65 0 1.2.55 1.2 1.2 0 .65-.55 1.2-1.2 1.2z"></path></svg>';
const closedIssueIcon = '<svg aria-label="issues" class="octicon octicon-issue-closed type-icon type-icon-state-closed" height="16" role="img" version="1.1" viewBox="0 0 16 16" width="16"><path d="M7 10h2v2H7v-2zm2-6H7v5h2V4zm1.5 1.5l-1 1L12 9l4-4.5-1-1L12 7l-1.5-1.5zM8 13.7A5.71 5.71 0 0 1 2.3 8c0-3.14 2.56-5.7 5.7-5.7 1.83 0 3.45.88 4.5 2.2l.92-.92A6.947 6.947 0 0 0 8 1C4.14 1 1 4.14 1 8s3.14 7 7 7 7-3.14 7-7l-1.52 1.52c-.66 2.41-2.86 4.19-5.48 4.19v-.01z"></path></svg>';
const openIssueIcon = '<svg aria-label="issues" class="octicon octicon-issue-opened type-icon type-icon-state-open" height="16" role="img" version="1.1" viewBox="0 0 14 16" width="14"><path d="M7 2.3c3.14 0 5.7 2.56 5.7 5.7s-2.56 5.7-5.7 5.7A5.71 5.71 0 0 1 1.3 8c0-3.14 2.56-5.7 5.7-5.7zM7 1C3.14 1 0 4.14 0 8s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm1 3H6v5h2V4zm0 6H6v2h2v-2z"></path></svg>';
const checkIcon = '<svg aria-hidden="true" class="octicon octicon-check" height="16" version="1.1" viewBox="0 0 12 16" width="12"><path d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5z"></path></svg>';
const muteIcon = '<svg aria-hidden="true" class="octicon octicon-mute" height="16" version="1.1" viewBox="0 0 16 16" width="16"><path d="M8 2.81v10.38c0 .67-.81 1-1.28.53L3 10H1c-.55 0-1-.45-1-1V7c0-.55.45-1 1-1h2l3.72-3.72C7.19 1.81 8 2.14 8 2.81zm7.53 3.22l-1.06-1.06-1.97 1.97-1.97-1.97-1.06 1.06L11.44 8 9.47 9.97l1.06 1.06 1.97-1.97 1.97 1.97 1.06-1.06L13.56 8l1.97-1.97z"></path></svg>';

window.markUnread = (() => {
	function stripHash(url) {
		return url.replace(/#.+$/, '');
	}

	function addMarkUnreadButton() {
		const button = $('<button class="btn btn-sm btn-mark-unread js-mark-unread">Mark as unread</button>');
		$('.js-thread-subscription-status').append(button);
	}

	function markRead(url) {
		const unreadNotifications = JSON.parse(localStorage.unreadNotifications || '[]');
		unreadNotifications.forEach((notification, index) => {
			if (notification.url === url) {
				unreadNotifications.splice(index, 1);
			}
		});

		localStorage.unreadNotifications = JSON.stringify(unreadNotifications);
	}

	function markUnread() {
		$(this).attr('disabled', 'disabled');
		$(this).text('Marked as unread');

		const participants = $('.participant-avatar').toArray().map(el => {
			const $el = $(el);

			return {
				username: $el.attr('aria-label'),
				avatar: $el.find('img').attr('src')
			};
		});

		const {ownerName, repoName} = pageDetect.getOwnerAndRepo();
		const repository = `${ownerName}/${repoName}`;
		const title = $('.js-issue-title').text().trim();
		const type = pageDetect.isPR() ? 'pull-request' : 'issue';
		const url = stripHash(location.href);

		const stateLabel = $('.gh-header-meta .state');
		let state;

		if (stateLabel.hasClass('state-open')) {
			state = 'open';
		}

		if (stateLabel.hasClass('state-merged')) {
			state = 'merged';
		}

		if (stateLabel.hasClass('state-closed')) {
			state = 'closed';
		}

		const lastCommentTime = $('.timeline-comment-header:last relative-time');
		const dateTitle = lastCommentTime.attr('title');
		const date = lastCommentTime.attr('datetime');

		const unreadNotifications = JSON.parse(localStorage.unreadNotifications || '[]');
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

		localStorage.unreadNotifications = JSON.stringify(unreadNotifications);
	}

	function renderNotifications() {
		const unreadNotifications = JSON.parse(localStorage.unreadNotifications || '[]')
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
			$('.blankslate').remove();
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
					icon = openIssueIcon;
				}

				if (state === 'closed') {
					icon = closedIssueIcon;
				}
			}

			if (type === 'pull-request') {
				if (state === 'open') {
					icon = openPullRequestIcon;
				}

				if (state === 'merged') {
					icon = mergedPullRequestIcon;
				}

				if (state === 'closed') {
					icon = closedPullRequestIcon;
				}
			}

			const hasList = $(`a.notifications-repo-link[title="${repository}"]`).length > 0;
			if (!hasList) {
				const list = $(`
					<div class="boxed-group flush">
						<form class="boxed-group-action">
							<button class="mark-all-as-read css-truncate tooltipped tooltipped-w js-mark-all-read" aria-label="Mark all notifications as read">
								${checkIcon}
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
								${checkIcon}
							</button>
						</li>
						<li class="mute">
							<button style="opacity: 0; pointer-events: none;">
								${muteIcon}
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
		return $('a.js-notification-target')
			.toArray()
			.filter(link => stripHash($(link).attr('href')) === stripHash(url))
			.length > 0;
	}

	function isEmptyPage() {
		return $('.blankslate').length > 0;
	}

	function isParticipatingPage() {
		return /\/notifications\/participating/.test(location.pathname);
	}

	function getUserName() {
		return $('#user-links a.name img').attr('alt').slice(1);
	}

	function markNotificationRead(e) {
		const notification = $(e.target).parents('li.js-notification');
		notification.addClass('read');

		const url = notification.find('a.js-notification-target').attr('href');
		markRead(url);
	}

	function markAllNotificationsRead(e) {
		e.preventDefault();

		$(e.target)
			.parents('.boxed-group')
			.find('ul.notifications li a.js-notification-target')
			.toArray()
			.forEach(el => {
				$(el).parents('.js-notification').removeClass('unread').addClass('read');
				markRead(el.href);
			});
	}

	function setup() {
		if (pageDetect.isNotifications()) {
			renderNotifications();
			$(document).on('click', '.js-mark-read', markNotificationRead);
			$(document).on('click', '.js-mark-all-read', markAllNotificationsRead);
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

	return {setup, destroy};
})();
