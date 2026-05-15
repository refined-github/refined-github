import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import getUserAvatarURL from '../github-helpers/get-user-avatar.js';
import {is, not} from '../helpers/css-selectors.js';
import onetime from '../helpers/onetime.js';
import observe from '../helpers/selector-observer.js';
import './small-user-avatars.css';

function createAvatar(username: string, size: number): JSX.Element {
	return (
		<img
			className="avatar avatar-user rgh-small-user-avatars"
			src={getUserAvatarURL(username, size)!}
			width={size}
			height={size}
			loading="lazy"
		/>
	);
}

function addRepoAvatar(link: HTMLAnchorElement): void {
	const [owner] = link.textContent.trim().split('/');
	const size = 14;

	link.firstElementChild!.prepend(
		<span className="ActionListItem-visual ActionListItem-visual--leading">
			{createAvatar(owner, size)}
		</span>,
	);
}

function addAvatar(link: HTMLElement): void {
	const username = link.textContent;
	const size = 14;

	link.classList.add('d-inline-block', 'lh-condensed-ultra');
	link.prepend(
		<span className='v-align-text-bottom mr-1'>
			{createAvatar(username, size)}
		</span>,
	);
}

function addMentionAvatar(link: HTMLAnchorElement): void {
	// Don't use textContent #8389
	const username = link.href.split('/').pop()!;
	const avatarUrl = getUserAvatarURL(username, 16)!;

	link.classList.add('rgh-small-user-avatars', 'rgh-mention-avatar');
	link.style.setProperty('--avatar-url', `url(${avatarUrl})`);
}

function initOnce(): void {
	// Excludes bots
	observe([
		'.js-issue-row [data-hovercard-type="user"]', // `isPRList` + old `isIssueList`
		'.notification-thread-subscription [data-hovercard-type="user"]', // https://github.com/notifications/subscriptions
		is(
			'[data-testid="created-at"]',
			'[data-testid="closed-at"]',
		) + ' a[data-hovercard-url*="/users"]', // `isIssueList`
	], addAvatar);
	observe(
		'.user-mention' + not(
			'.opened-by > *', // Merge queue
			'.commit-author',
		),
		addMentionAvatar,
	);
}

function initNotifications(signal: AbortSignal): void {
	observe(
		'nav[aria-label="Repositories"] .ActionListItem[data-targets="nav-list.items"]', // Repos list in the left sidebar
		addRepoAvatar,
		{signal},
	);
}

void features.add(import.meta.url, {
	init: onetime(initOnce),
}, {
	include: [
		pageDetect.isNotifications,
	],
	init: initNotifications,
});

/*

Test URLs:

https://github.com/notifications/subscriptions
https://github.com/refined-github/refined-github/issues
https://github.com/refined-github/refined-github/pull/7004
https://github.com/refined-github/refined-github/issues/8802#issuecomment-3711163697
https://github.com/refined-github/refined-github/releases
https://github.com/refined-github/refined-github/releases/tag/23.9.21
https://github.com/orgs/community/discussions/5841#discussioncomment-1450320

*/
