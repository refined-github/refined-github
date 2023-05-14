import './small-user-avatars.css';
import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import getUserAvatarURL from '../github-helpers/get-user-avatar.js';

function addAvatar(link: HTMLElement): void {
	const username = link.textContent!;
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

function init(signal: AbortSignal): void {
	// Excludes bots
	observe(':is(.js-issue-row, .js-pinned-issue-list-item) [data-hovercard-type="user"]', addAvatar, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isIssueOrPRList,
	],
	init,
});

/*

Test URLs:

https://github.com/refined-github/refined-github/issues

*/
