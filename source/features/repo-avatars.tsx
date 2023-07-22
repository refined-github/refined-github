import React from 'dom-chef';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import {getRepo} from '../github-helpers/index.js';
import getUserAvatar from '../github-helpers/get-user-avatar.js';

async function init(): Promise<void> {
	// There are many such "label" elements
	const location = await elementReady('.AppHeader-context-full .AppHeader-context-item-label');
	const username = getRepo()!.owner;
	const size = 16;
	const src = getUserAvatar(username, size)!;

	const avatar = (
		<img
			className="avatar mx-1 d-block"
			src={src}
			width={size}
			height={size}
			alt={`@${username}`}
		/>
	);

	location!.classList.add('d-flex', 'flex-items-center');
	location!.prepend(avatar);

	if (!location!.closest('[data-hovercard-type="organization"]')) {
		avatar.classList.add('avatar-user');
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasRepoHeader,
	],
	deduplicate: 'has-rgh',
	init,
});

/*

## Test URLs

- org repo: https://github.com/refined-github/refined-github
- user repo: https://github.com/fregante/GhostText

*/
