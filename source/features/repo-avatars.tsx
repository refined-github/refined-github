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
	const src = getUserAvatar(username, 24)!;

	const avatar = (
		<img
			className="avatar flex-self-stretch mr-2"
			src={src}
			width="24"
			height="24"
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
