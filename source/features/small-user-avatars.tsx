import './small-user-avatars.css';

import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import getUserAvatarURL from '../github-helpers/get-user-avatar.js';
import {assertUsername} from '../github-helpers/index.js';
import {is, not} from '../helpers/css-selectors.js';
import {isSmallDevice} from '../helpers/dom-utils.js';
import onetime from '../helpers/onetime.js';
import observe from '../helpers/selector-observer.js';

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
	const [owner] = link.textContent.trim().split('/', 1);

	link.firstElementChild!.prepend(
		<span className="ActionListItem-visual ActionListItem-visual--leading d-none d-xl-inline-block">
			{createAvatar(owner, 14)}
		</span>,
	);
}

function extractUsername(element: HTMLElement): string {
	// Preview issue lists have no aria-label and wrap the login in a visually hidden "Filter by author " label, so it's read from `data-hovercard-url` instead.
	// Preview PR lists have no data-hovercard-url; both aria-label and textContent are the bare login there.
	// Legacy lists need none of this: their selectors only match user hovercards, so their text is always a login.
	const hovercardUrl = element.getAttribute('data-hovercard-url');
	const username = hovercardUrl ? hovercardUrl.split('/', 3)[2] : element.textContent;

	// The extracted login is used to build an avatar URL, anything else (e.g. "Filter by author X") would be broken
	// GitHub appends `[bot]` to bot logins in PR lists.
	assertUsername(username.replace(/\[bot\]$/, ''));

	return username;
}

function addAvatar(link: HTMLElement): void {
	const username = extractUsername(link);
	const avatar = createAvatar(username, 14);
	avatar.classList.add('v-align-text-bottom', 'mr-1', 'tmp-mr-1');

	link.classList.add('d-inline-block', 'lh-condensed-ultra');
	link.prepend(avatar);
}

function addMentionAvatar(link: HTMLAnchorElement): void {
	// Don't use textContent #8389
	const username = link.href.split('/').pop()!;
	const avatarUrl = getUserAvatarURL(username, 16)!;

	link.classList.add('rgh-small-user-avatars', 'rgh-mention-avatar');
	link.style.setProperty('--avatar-url', `url(${avatarUrl})`);
}

function initOnce(): void {
	observe([
		'.js-issue-row [data-hovercard-type="user"]', // `isPRList` + old `isIssueList`
		'.notification-thread-subscription [data-hovercard-type="user"]', // https://github.com/notifications/subscriptions
		is(
			'[data-testid="created-at"]',
			'[data-testid="closed-at"]',
		) + ' a[data-hovercard-url*="/users"]', // `isIssueList`
		// `a` on repository PR lists, including `attributed-author-filter-link` for app-created PRs
		// `button` on https://github.com/pulls/authored
		'[aria-label^="Filter by author "]',
		// `button` on https://github.com/issues/* (no aria-label, hides "Filter by author " in its text)
		'[data-testid="author-filter-link"][data-hovercard-type="user"]',
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
	exclude: [
		isSmallDevice,
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
