import React from 'dom-chef';
import select from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';

async function init(): Promise<void> {
	// Icon for public but not template/fork/etc. repos
	const icon = await elementReady('#repository-container-header .octicon-repo');
	if (!icon) {
		return;
	}

	const author = select('#repository-container-header [rel=author]')!;
	const username = author.textContent!;
	const alt = `@${username}`;
	const fallbackSrc = (pageDetect.isEnterprise()
		? `/${username}.png`
		: `https://avatars.githubusercontent.com/${username}`) + '?size=48';
	const src = select(`img[alt="${alt}"]`)?.src ?? fallbackSrc;

	const avatar = (
		<img
			className="avatar mr-2"
			src={src}
			width="24"
			height="24"
			alt={alt}
		/>
	);

	if (author.dataset.hovercardType === 'user') {
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
