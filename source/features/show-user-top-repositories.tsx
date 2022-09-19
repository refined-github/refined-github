import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import attachElement from '../helpers/attach-element';

function init(): void {
	const url = new URL(location.pathname, location.href);
	// DO NOT add type: 'source' since forks could also have many stars
	url.search = new URLSearchParams({
		tab: 'repositories',
		sort: 'stargazers',
	}).toString();

	// Add top repositories link
	const pinnedText = select('.js-pinned-items-reorder-container .text-normal')!;
	const topReposLink = (
		<span>
			/&nbsp;<a href={url.href}>Top repositories</a>
		</span>
	);

	attachElement({
		anchor: pinnedText,
		append: () => topReposLink,
	});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isUserProfileMainTab,
	],
	exclude: [
		pageDetect.isPrivateUserProfile,
	],
	init,
});
