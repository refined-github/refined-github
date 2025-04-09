import React from 'dom-chef';

import onetime from '../helpers/onetime.js';
import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import getUserAvatarURL from '../github-helpers/get-user-avatar.js';
import './small-user-avatars.css';

function addAvatar(link: HTMLElement): void {
	const username = link.textContent;
	const size = 14;

	link.classList.add('d-inline-block', 'lh-condensed-ultra');
	link.prepend(
		<img
			className="avatar avatar-user v-align-text-bottom mr-1 rgh-small-user-avatars"
			src={getUserAvatarURL(username, size)!}
			width={size}
			height={size}
			loading="lazy"
		/>,
	);
}

function addMentionAvatar(link: HTMLAnchorElement): void {
	const username = link.href.split('/').pop()!;
	const avatarUrl = getUserAvatarURL(username, 16);

	link.classList.add('rgh-small-user-avatars', 'rgh-mention-avatar');
	link.style.setProperty('--avatar-url', `url(${avatarUrl})`);
}

function initOnce(): void {
	// Excludes bots
	observe([
		'.js-issue-row [data-hovercard-type="user"]', // `isPRList` + old `isIssueList`
		'.notification-thread-subscription [data-hovercard-type="user"]', // https://github.com/notifications/subscriptions
		`:is(
			[data-testid="created-at"],
			[data-testid="closed-at"]
		) a[data-hovercard-url*="/users"]`, // `isIssueList`
	], addAvatar);
	observe('.user-mention:not(.commit-author)[data-hovercard-type="user"]', addMentionAvatar);
}

void features.add(import.meta.url, {
	init: onetime(initOnce),
});

/*

Test URLs:

https://github.com/notifications/subscriptions
https://github.com/refined-github/refined-github/issues
https://github.com/refined-github/refined-github/pull/7004
https://github.com/refined-github/refined-github/releases
https://github.com/refined-github/refined-github/releases/tag/23.9.21
https://github.com/orgs/community/discussions/5841#discussioncomment-1450320

*/
