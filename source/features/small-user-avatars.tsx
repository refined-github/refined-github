import './small-user-avatars.css';

import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import {$optional, elementExists} from 'select-dom';

import features from '../feature-manager.js';
import getUserAvatarURL from '../github-helpers/get-user-avatar.js';
import {is, not} from '../helpers/css-selectors.js';
import {isSmallDevice} from '../helpers/dom-utils.js';
import onetime from '../helpers/onetime.js';
import observe from '../helpers/selector-observer.js';
import {listAuthorSelector} from '../github-helpers/selectors.js';

function createAvatar(username: string, size: number): JSX.Element {
	return (
		<img
			className="avatar avatar-user rgh-small-user-avatars"
			src={getUserAvatarURL(username, size)!}
			width={size}
			height={size}
			loading="lazy"
			alt=""
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

function addAvatar(link: HTMLElement, username = link.textContent): void {
	if (elementExists('img.rgh-small-user-avatars', link)) {
		return;
	}

	const avatar = createAvatar(username, 14);
	avatar.classList.add('v-align-text-bottom', 'mr-1', 'tmp-mr-1');

	link.classList.add('d-inline-block', 'lh-condensed-ultra');
	link.prepend(avatar);
}

function addListAvatar(author: HTMLElement): void {
	// Prefer hovercards; direct text excludes hidden accessibility spans and injected content.
	const hovercard = author.getAttribute('data-hovercard-url');
	const username = hovercard
		// Malformed or non-user hovercard.
		? /^\/users\/(?<login>[^/]+)\/hovercard$/.exec(hovercard)?.groups?.login ?? ''
		: [...author.childNodes].filter(node => node.nodeType === Node.TEXT_NODE).map(node => node.textContent).join('').trim();
	const existing = $optional('img.rgh-small-user-avatars', author);
	if (!/^[\w-]+$/.test(username) || author.matches(is(
		'[data-hovercard-type="bot"]', // Bots with hovercards
		'[href^="/apps/"]', // Legacy app authors
		'[href^="/github-apps/"]', // GHE apps
	))) {
		// A reused author may still have a previous human's avatar.
		existing?.remove();
		return;
	}

	const avatarUrl = getUserAvatarURL(username, 14)!;
	if (existing) {
		if (existing.getAttribute('src') !== avatarUrl) {
			existing.setAttribute('src', avatarUrl);
		}

		return;
	}

	addAvatar(author, username);
}

function addMentionAvatar(link: HTMLAnchorElement): void {
	// Don't use textContent #8389
	const username = link.href.split('/').pop()!;
	const avatarUrl = getUserAvatarURL(username, 16)!;

	link.classList.add('rgh-small-user-avatars', 'rgh-mention-avatar');
	link.style.setProperty('--avatar-url', `url(${avatarUrl})`);
}

function initOnce(): void {
	// Keep legacy authors on the existing avatar path, including nested username text.
	observe<string, HTMLElement>(is(listAuthorSelector) + not('.opened-by a'), author => {
		addListAvatar(author);
		// Restore/update avatars when React reuses the author or replaces its children.
		const observer = new MutationObserver(() => {
			addListAvatar(author);
		});
		observer.observe(author, {
			childList: true,
			subtree: true,
			characterData: true,
			attributes: true,
			attributeFilter: ['data-hovercard-url', 'data-hovercard-type', 'href'],
		});
	});
	// Excludes bots
	observe<string, HTMLElement>([
		'.js-issue-row [data-hovercard-type="user"]', // `isPRList` + old `isIssueList`
		'.notification-thread-subscription [data-hovercard-type="user"]', // https://github.com/notifications/subscriptions
		is(
			'[data-testid="created-at"]',
			'[data-testid="closed-at"]',
		) + ' a[data-hovercard-url*="/users"]', // `isIssueList`
	], link => {
		if (link.matches('.opened-by a') || !link.matches(listAuthorSelector.join(','))) {
			addAvatar(link);
		}
	});
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
