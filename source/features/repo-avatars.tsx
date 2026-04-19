import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import {getRepo} from '../github-helpers/index.js';
import getUserAvatar from '../github-helpers/get-user-avatar.js';
import observe from '../helpers/selector-observer.js';
import {isSmallDevice} from '../helpers/dom-utils.js';

async function add(ownerLabel: HTMLElement): Promise<void> {
	// TODO: Drop after June 2026
	const isOldNavbar = ownerLabel.classList.contains('AppHeader-context-item-label');

	const username = getRepo()!.owner;
	const size = 16;
	const source = getUserAvatar(username, size)!;

	const avatar = (
		<img
			className={`avatar ${isOldNavbar ? 'ml-1' : ''} mr-2`}
			src={source}
			width={size}
			height={size}
			alt={`@${username}`}
		/>
	);

	(isOldNavbar ? ownerLabel : ownerLabel.parentElement!).classList.add('d-flex', 'flex-items-center');

	ownerLabel.prepend(avatar);

	if (!pageDetect.isOrganizationRepo()) {
		avatar.classList.add('avatar-user');
	}
}

function init(signal: AbortSignal): void {
	observe([
		'.AppHeader-context-full [role="listitem"]:first-child .AppHeader-context-item-label', // TODO: Drop after June 2026
		'div[data-testid="top-nav-center"] li:first-child > a[class*="prc-Breadcrumbs-Item"]',
	], add, {signal});
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
