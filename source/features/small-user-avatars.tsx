import React from 'dom-chef';

import onetime from '../helpers/onetime.js';
import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import {getUserAvatar} from '../github-helpers/get-user-avatar.js';
import './small-user-avatars.css';

function addAvatar(link: HTMLAnchorElement): void {
	const username = link.classList.contains('user-mention')
		? link.href.split('/').pop()! // #8389
		: link.textContent;
	const avatar = getUserAvatar(username, 14);

	link.classList.add('d-inline-block', 'lh-condensed-ultra');
	link.prepend(
		<span
			className="avatar avatar-user v-align-text-bottom mr-1 rgh-small-user-avatars"
			aria-hidden="true" // https://github.com/refined-github/refined-github/issues/8218#issuecomment-3762891075
		>
			{typeof avatar === 'string'
				? <img src={avatar} loading="lazy" />
				// @ts-expect-error -- createElement should infer the props, but it doesn't
				: React.createElement(avatar, {width: '75%', height: '75%'})
			}
		</span>,
	);
}

function initOnce(): void {
	// Excludes bots
	observe([
		'.js-issue-row a[data-hovercard-type="user"]', // `isPRList` + old `isIssueList`
		'.notification-thread-subscription a[data-hovercard-type="user"]', // https://github.com/notifications/subscriptions
		`:is(
			[data-testid="created-at"],
			[data-testid="closed-at"]
		) a[data-hovercard-url*="/users"]`, // `isIssueList`
		'a.user-mention:not(.commit-author)',
	], addAvatar);
}

void features.add(import.meta.url, {
	init: onetime(initOnce),
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
