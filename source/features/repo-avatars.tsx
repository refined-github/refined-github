import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import cx from 'clsx';

import features from '../feature-manager.js';
import getUserAvatar from '../github-helpers/get-user-avatar.js';
import {getRepo} from '../github-helpers/index.js';
import {isSmallDevice} from '../helpers/dom-utils.js';
import observe from '../helpers/selector-observer.js';

async function add(ownerLabel: HTMLElement): Promise<void> {
	const username = getRepo()!.owner;
	const size = 16;
	const source = getUserAvatar(username, size)!;

	ownerLabel.parentElement!.classList.add('d-flex', 'flex-items-center');

	ownerLabel.prepend(
		<img
			className={cx(
				'avatar mr-2 tmp-mr-2',
				!pageDetect.isOrganizationProfile() && 'avatar-user',
			)}
			src={source}
			width={size}
			height={size}
			alt={`@${username}`}
		/>,
	);
}

function init(signal: AbortSignal): void {
	const username = getRepo()!.owner;
	observe('.loaded nav[data-component="Breadcrumbs"] a[href="/' + username + '"]', add, {signal});
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
