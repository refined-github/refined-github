/* globals pageDetect, icons */

'use strict';

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

		const stateLabel = $('.gh-header-meta .State');
		let state;

		if (stateLabel.hasClass('State--green')) {
			state = 'open';
		}

		if (stateLabel.hasClass('State--purple')) {
			state = 'merged';
		}

		if (stateLabel.hasClass('State--red')) {
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

			const hasList = $(`a.notifications-repo-link[title="${repository}"]`).length > 0;
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

	function addCustomAllReadBtn() {
		const $markAllReadBtn = $('#notification-center a[href="#mark_as_read_confirm_box"]');
		if ($markAllReadBtn.length >= 1 || JSON.parse(localStorage.unreadNotifications).length === 0) {
			return;
		}

		const $tabNav = $('#notification-center .tabnav-tabs:first ');
		const markAllBtnCustom = `
			<div class="float-right">
			    <a href="#mark_as_read_confirm_box" class="btn btn-sm " rel="facebox">Mark all as read</a>
    			<div id="mark_as_read_confirm_box" style="display:none">
	        		<h2 class="facebox-header" data-facebox-id="facebox-header">Are you sure?</h2>
	        		<p data-facebox-id="facebox-description">Are you sure you want to mark all unread notifications as read?</p>
	            	<div class="full-button">
	                	<button  id="clear-local-notification" class="btn btn-block">Mark all notifications as read</button>
	            	</div>
    			</div>
    		</div>`;

		$tabNav.append(markAllBtnCustom);

		$(document).on('click', '#clear-local-notification', () => {
			localStorage.unreadNotifications = '[]';
			window.location.reload();
		});
	}

	function countLocalNotifications() {
		const $unreadCount = $('#notification-center .filter-list a[href="/notifications"] .count');
		const githubNotificationsCount = Number($unreadCount.text());
		let localNotificationsCount = 0;
		const localNotifications = localStorage.unreadNotifications;

		if (localNotifications) {
			localNotificationsCount = JSON.parse(localNotifications).length;
			$unreadCount.text(githubNotificationsCount + localNotificationsCount);
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
				localStorage.unreadNotifications = '[]';
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

	return {setup, destroy};
})();
