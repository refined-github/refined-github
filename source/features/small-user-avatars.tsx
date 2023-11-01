import React from 'dom-chef';

import onetime from 'onetime';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import getUserAvatarURL from '../github-helpers/get-user-avatar.js';

function addAvatar(link: HTMLElement): void {
	const username = link.textContent;
	const size = 14;

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

function addMentionAvatar(link: HTMLElement): void {
	const username = link.textContent.slice(1);
	const size = 16;

	link.prepend(
		<img
			className="avatar avatar-user mb-1 mr-1 rgh-small-user-avatars"
			style={{marginLeft: 1}}
			src={getUserAvatarURL(username, size)!}
			width={size}
			height={size}
			loading="lazy"
		/>,
	);
}

function init(): void {
	// Excludes bots
	observe([
		'.js-issue-row [data-hovercard-type="user"]',
		'.notification-thread-subscription [data-hovercard-type="user"]',
	], addAvatar);
	observe('.user-mention[data-hovercard-type="user"]', addMentionAvatar);
}

void features.add(import.meta.url, {
	init: onetime(init),
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
