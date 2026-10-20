import './small-user-avatars.css';

import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import getUserAvatarURL, {stripBotMarkers} from '../github-helpers/get-user-avatar.js';
import {assertUsername} from '../github-helpers/index.js';
import {not} from '../helpers/css-selectors.js';
import {isSmallDevice} from '../helpers/dom-utils.js';
import onetime from '../helpers/onetime.js';
import observe from '../helpers/selector-observer.js';

function createAvatar(username: string): JSX.Element | undefined {
	const size = 14;
	const source = getUserAvatarURL(username, size);
	return source
		? (
			<img
				className="avatar avatar-user rgh-small-user-avatars"
				src={source}
				width={size}
				height={size}
				loading="lazy"
			/>
		)
		: undefined;
}

function addRepoAvatar(link: HTMLAnchorElement): void {
	const [owner] = link.textContent.trim().split('/', 1);
	const avatar = createAvatar(owner);
	if (!avatar) {
		return;
	}

	link.firstElementChild!.prepend(
		<span className="ActionListItem-visual ActionListItem-visual--leading d-none d-xl-inline-block">
			{avatar}
		</span>,
	);
}

/** Extracts user from attribute values */
const userAttributeRegexes = [
	// [data-hovercard-url="/users/fregante/hovercard"]
	// https://github.com/refined-github/refined-github/pulls?q=is%3Apr+lol+wow
	/^[/]users[/](?<username>[^/]+)[/]hovercard$/,
	// [data-hovercard-url="/copilot/hovercard?bot=copilot-swe-agent"]
	// https://github.com/refined-github/refined-github/pulls?q=is%3Apr+is%3Aclosed+copilot+regression
	/^[/]copilot[/]hovercard[?]bot=(?<username>[^&?]+)$/,
	// [aria-label="Filter by author github-user-here"]
	// https://github.com/pulls/involves
	/^Filter by author (?<username>[^ ]+)$/,
];

function extractUsernameFromAttribute(attribute: string): string | undefined {
	for (const regex of userAttributeRegexes) {
		const match = regex.exec(attribute);
		if (match) {
			return match.groups!.username;
		}
	}

	return undefined;
}

function extractUsername(element: HTMLAnchorElement | HTMLButtonElement): string {
	// Prefer reading username from URL if present.
	// - [data-hovercard-url]: everywhere but the React PR lists (global and repo)
	// - [aria-label="Filter by author github-user-here"]: in React PR lists (global and repo)
	const attribute = element.getAttribute('data-hovercard-url') ?? element.getAttribute('aria-label');

	// If there's no match, the following assertion will fail
	const username = extractUsernameFromAttribute(attribute ?? '')
		// The issue list on some repos only has a link to `?q=author:app/dependabot`
		// https://github.com/eslint/eslint/issues?q=author%3Aapp%2Fdependabot
		?? URL.parse(element.getAttribute('href') ?? '', location.href)?.searchParams.get('q')?.match(
			/\bauthor:(?<username>\S+)/,
		)?.groups?.username
		// Fallback to the last child text content if it couldn't be extracted from known strings
		?? element.lastChild?.textContent.trim()
		?? '';

	// GitHub marks bots as `[bot]` or `app/`
	assertUsername(stripBotMarkers(username));

	return username;
}

function addIssueRowAvatar(link: HTMLAnchorElement | HTMLButtonElement): void {
	const username = extractUsername(link);
	const avatar = createAvatar(username);
	if (!avatar) {
		return;
	}

	avatar.classList.add('v-align-text-bottom', 'mr-1', 'tmp-mr-1');

	link.classList.add('d-inline-block', 'lh-condensed-ultra');
	link.prepend(avatar);
}

function addMentionAvatar(link: HTMLAnchorElement): void {
	// Don't use textContent #8389
	const username = link.href.split('/').pop()!;
	if (location.pathname === '/sponsors/' + username) {
		// Redundant: https://github.com/refined-github/refined-github/issues/9815
		return;
	}

	const avatarUrl = getUserAvatarURL(username, 16);
	if (!avatarUrl) {
		return;
	}

	link.classList.add('rgh-small-user-avatars', 'rgh-mention-avatar');
	link.style.setProperty('--avatar-url', `url(${avatarUrl})`);
}

function initOnce(): void {
	observe([
		'.js-issue-row a[data-hovercard-type="user"]', // `isPRList` TODO: Drop in February 2027
		'.notification-thread-subscription a[data-hovercard-type="user"]', // https://github.com/notifications/subscriptions
		'[data-testid="created-at"] a[data-hovercard-url*="/users"]', // `isIssueList`
		'[data-testid="closed-at"] a[data-hovercard-url*="/users"]', // `isIssueList`
		// `a` on repository PR lists, including `attributed-author-filter-link` for app-created PRs
		// `button` on https://github.com/pulls/authored
		'[aria-label^="Filter by author "]:is(a, button)',
		// `button` on https://github.com/issues/* (no aria-label, hides "Filter by author " in its text)
		'button[data-testid="author-filter-link"][data-hovercard-type="user"]',
	], addIssueRowAvatar);
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
User with AI bot: https://github.com/pulls/authored?q=is%3Apr+author%3Afregante+state%3Aopen+archived%3Afalse+sort%3Aupdated-desc+linkify
Bots as `app/`: https://github.com/eslint/eslint/issues?q=author%3Aapp%2Fdependabot
Bots as `[bot]`: https://github.com/eslint/eslint/issues?q=author%3Adependabot%5Bbot%5D

*/
