import React from 'dom-chef';
import select from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import {getRepo} from '../github-helpers';
import getUserAvatar from '../github-helpers/get-user-avatar';

async function init(): Promise<void> {
	// Icon for public but not template/fork/etc. repos
	const icon = await elementReady('#repository-container-header .octicon-repo');
	if (!icon) {
		return;
	}

	const link = select('#repository-container-header a[rel="author"]')!.cloneNode();
	const username = getRepo()!.owner;
	const size = 24;
	const src = getUserAvatar(username, size)!;

	const avatar = (
		<img
			className="avatar mr-2 d-block"
			src={src}
			width={size}
			height={size}
			alt={`@${username}`}
		/>
	);

	link.append(avatar);
	icon.replaceWith(link);

	if (link.dataset.hovercardType !== 'organization') {
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
