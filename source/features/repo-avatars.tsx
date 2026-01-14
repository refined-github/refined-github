import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import {getRepo} from '../github-helpers/index.js';
import getUserAvatar from '../github-helpers/get-user-avatar.js';
import observe from '../helpers/selector-observer.js';

async function add(ownerLabel: HTMLElement): Promise<void> {
	const username = getRepo()!.owner;
	const size = 16;
	const source = getUserAvatar(username, size)!;

	const avatar = (
		<img
			className="avatar ml-1 mr-2"
			src={source}
			width={size}
			height={size}
			alt={`@${username}`}
		/>
	);

	ownerLabel.classList.add('d-flex', 'flex-items-center');
	ownerLabel.prepend(avatar);

	if (!ownerLabel.closest('[data-hovercard-type="organization"]')) {
		avatar.classList.add('avatar-user');
	}
}

function init(signal: AbortSignal): void {
	observe('header.GlobalNav [data-testid="top-nav-center"] ol > li:first-child span', add, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasRepoHeader,
	],
	init,
});

/*

## Test URLs

- org repo: https://github.com/refined-github/refined-github/issues
- user repo: https://github.com/fregante/GhostText/issues

*/
