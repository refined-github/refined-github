import React from 'dom-chef';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {getRepo} from '../github-helpers';
import getUserAvatar from '../github-helpers/get-user-avatar';

async function init(): Promise<void> {
	// Icon for public but not template/fork/etc. repos
	const icon = await elementReady('#repository-container-header .octicon-repo');
	if (!icon) {
		return;
	}

	const username = getRepo()!.owner;
	const size = 24;
	const src = getUserAvatar(username, size)!;

	const avatar = (
		<img
			className="avatar mr-2"
			src={src}
			width={size}
			height={size}
			alt={`@${username}`}
		/>
	);

	if (!pageDetect.isOrganizationRepo()) {
		avatar.classList.add('avatar-user');
	}

	icon.replaceWith(avatar);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepo,
	],
	init,
	awaitDomReady: false,
});
