import './mention-avatars.css';
import React from 'dom-chef';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import getUserAvatarURL from '../github-helpers/get-user-avatar.js';

function addAvatar(link: HTMLElement): void {
	const username = link.textContent!.slice(1);
	const size = 16;

	link.prepend(
		<img
			className="avatar avatar-user mr-1 rgh-mention-avatars"
			src={getUserAvatarURL(username, size)!}
			width={size}
			height={size}
			loading="lazy"
		/>,
	);
}

function init(signal: AbortSignal): void {
	// Excludes bots
	observe('.user-mention[data-hovercard-type="user"]', addAvatar, {signal});
}

void features.add(import.meta.url, {
	init,
});

/*

Test URLs:

https://github.com/refined-github/refined-github/issues/6919
https://github.com/refined-github/refined-github/releases
https://github.com/refined-github/refined-github/releases/tag/23.9.21

*/
