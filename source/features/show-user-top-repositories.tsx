import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {isPrivateUserProfile} from '../github-helpers';

function init(): void {
	const url = new URL(location.pathname, location.href);
	// DO NOT add type: 'source' since forks could also have many stars
	url.search = new URLSearchParams({
		tab: 'repositories',
		sort: 'stargazers',
	}).toString();

	// Showcase title
	select('.js-pinned-items-reorder-container .text-normal')!.firstChild!.after(
		' / ',
		<a href={url.href}>Top repositories</a>,
	);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isUserProfileMainTab,
	],
	exclude: [
		isPrivateUserProfile,
	],
	init,
});
