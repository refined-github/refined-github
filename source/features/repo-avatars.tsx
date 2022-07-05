import React from 'dom-chef';
import select from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {getRepo, getUserAvatar} from '../github-helpers';

async function init(): Promise<void> {
	// Icon for public but not template/fork/etc. repos
	const icon = await elementReady('#repository-container-header .octicon-repo');
	if (!icon) {
		return;
	}

	const username = getRepo()!.owner;
	const alt = `@${username}`;
	const src = select(`img[alt="${alt}"]`)?.src ?? getUserAvatar(username, 24);

	const avatar = (
		<img
			className="avatar mr-2"
			src={src}
			width="24"
			height="24"
			alt={alt}
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
