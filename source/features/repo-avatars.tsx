import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import getUserAvatar from '../github-helpers/get-user-avatar.js';
import {getRepo} from '../github-helpers/index.js';
import {isSmallDevice} from '../helpers/dom-utils.js';
import observe from '../helpers/selector-observer.js';

async function add(ownerLabel: HTMLElement): Promise<void> {
	const username = getRepo()!.owner;
	const size = 16;
	const source = getUserAvatar(username, size)!;

	const avatar = (
		<img
			className='d-none d-md-block avatar mr-2 tmp-mr-2'
			src={source}
			width={size}
			height={size}
			alt={`@${username}`}
		/>
	);

	ownerLabel.parentElement!.classList.add('d-flex', 'flex-items-center');

	ownerLabel.prepend(avatar);

	if (!pageDetect.isOrganizationRepo()) {
		avatar.classList.add('avatar-user');
	}
}

function init(signal: AbortSignal): void {
	observe(
		'.loaded div[data-testid="top-nav-center"] li:first-child > a[class*="prc-Breadcrumbs-Item"]',
		add,
		{signal},
	);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasRepoHeader,
	],
	exclude: [
		isSmallDevice,
	],
	init,
});

/*

## Test URLs

- org repo: https://github.com/refined-github/refined-github/issues
- user repo: https://github.com/fregante/GhostText/issues

*/
